import "server-only";
import { SessionStatus, type ConversationSession } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { debitUsage } from "@/lib/credits/ledger";
import { pusherServer, sessionChannelName } from "@/lib/realtime/pusher-server";
import { EVENTS, type SessionUpdatedPayload, type SessionWarningPayload } from "@/lib/realtime/events";
import { GRACE_PERIOD_MS } from "@/lib/sessions/constants";

/**
 * The server-authoritative timer tick. Called from the message-send route,
 * the heartbeat route, and a periodic cron sweep — never trust a client to
 * report elapsed time. Billing is wall-clock-delta driven (elapsed minutes
 * vs. minutesDebited already charged), not tick-accumulated, so drift or a
 * missed tick can't over/under-charge: the next call just catches up.
 */
export async function recomputeSession(sessionId: string): Promise<ConversationSession> {
  const session = await prisma.conversationSession.findUniqueOrThrow({
    where: { id: sessionId },
  });

  if (session.status === SessionStatus.ACTIVE) {
    return tickActive(session);
  }
  if (session.status === SessionStatus.GRACE) {
    return tickGrace(session);
  }
  return session;
}

async function tickActive(session: ConversationSession): Promise<ConversationSession> {
  const now = new Date();
  const startedAt = session.startedAt ?? now;
  const elapsedMinutes = Math.floor((now.getTime() - startedAt.getTime()) / 60_000);
  const deltaMinutes = elapsedMinutes - session.minutesDebited;

  let minutesDebited = session.minutesDebited;
  let balance = (
    await prisma.user.findUniqueOrThrow({
      where: { id: session.userId },
      select: { creditBalance: true },
    })
  ).creditBalance;

  if (deltaMinutes > 0) {
    const debitable = Math.min(deltaMinutes, balance);
    if (debitable > 0) {
      const result = await debitUsage(session.userId, session.id, debitable, session.minutesDebited);
      minutesDebited += debitable;
      balance = result.balance;
    }
  }

  // <= 0, not just "couldn't afford the full elapsed delta": a tick that
  // debits exactly the remaining balance (elapsed time lines up precisely
  // with what's left) must still enter grace, or the session gets stuck
  // ACTIVE forever showing 0:00 remaining.
  if (balance <= 0) {
    return enterGrace(session, minutesDebited);
  }

  const endsAt = new Date(now.getTime() + balance * 60_000);

  const updates: Parameters<typeof prisma.conversationSession.update>[0]["data"] = {
    minutesDebited,
    endsAt,
  };

  const remainingMs = endsAt.getTime() - now.getTime();
  let warning: 5 | 1 | undefined;
  if (remainingMs <= 5 * 60_000 && !session.warned5MinAt) {
    updates.warned5MinAt = now;
    warning = 5;
  }
  if (remainingMs <= 1 * 60_000 && !session.warned1MinAt) {
    updates.warned1MinAt = now;
    warning = 1;
  }

  const updated = await prisma.conversationSession.update({
    where: { id: session.id },
    data: updates,
  });

  await publishSessionUpdated(updated);
  if (warning) {
    await publishWarning(updated.id, warning);
  }

  return updated;
}

async function enterGrace(
  session: ConversationSession,
  minutesDebited: number
): Promise<ConversationSession> {
  const now = new Date();
  const updated = await prisma.conversationSession.update({
    where: { id: session.id },
    data: {
      status: SessionStatus.GRACE,
      minutesDebited,
      // endsAt now doubles as "grace started at" — see tickGrace().
      endsAt: now,
    },
  });
  await publishSessionUpdated(updated);
  return updated;
}

async function tickGrace(session: ConversationSession): Promise<ConversationSession> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { creditBalance: true },
  });

  // Buying more time while in grace resumes the SAME session on the SAME
  // channel — no reconnect, no lost context.
  if (user.creditBalance > 0) {
    return resumeFromGrace(session, user.creditBalance);
  }

  const graceStartedAt = session.endsAt ?? new Date();
  const now = new Date();

  if (now.getTime() - graceStartedAt.getTime() < GRACE_PERIOD_MS) {
    return session;
  }

  const updated = await prisma.conversationSession.update({
    where: { id: session.id },
    data: {
      status: SessionStatus.ENDED,
      endedAt: now,
      endReason: "grace_timeout",
    },
  });
  await publishSessionUpdated(updated);
  return updated;
}

async function resumeFromGrace(
  session: ConversationSession,
  balanceMinutes: number
): Promise<ConversationSession> {
  const now = new Date();
  const updated = await prisma.conversationSession.update({
    where: { id: session.id },
    data: {
      status: SessionStatus.ACTIVE,
      startedAt: now,
      minutesDebited: 0,
      endsAt: new Date(now.getTime() + balanceMinutes * 60_000),
      warned5MinAt: null,
      warned1MinAt: null,
    },
  });
  await publishSessionUpdated(updated);
  return updated;
}

/** Called right after a purchase webhook grants credit, so a user waiting in
 * the grace period sees their session resume immediately instead of on the
 * next heartbeat. */
export async function tryResumeGraceSession(userId: string): Promise<void> {
  const graceSession = await prisma.conversationSession.findFirst({
    where: { userId, status: SessionStatus.GRACE },
  });
  if (graceSession) {
    await recomputeSession(graceSession.id);
  }
}

async function publishSessionUpdated(session: ConversationSession) {
  const payload: SessionUpdatedPayload = {
    status: session.status,
    endsAt: session.endsAt?.toISOString() ?? null,
    startedAt: session.startedAt?.toISOString() ?? null,
    endReason: session.endReason,
  };
  await pusherServer.trigger(sessionChannelName(session.id), EVENTS.SESSION_UPDATED, payload);
}

async function publishWarning(sessionId: string, minutesRemaining: 5 | 1) {
  const payload: SessionWarningPayload = { minutesRemaining };
  await pusherServer.trigger(sessionChannelName(sessionId), EVENTS.SESSION_WARNING, payload);
}
