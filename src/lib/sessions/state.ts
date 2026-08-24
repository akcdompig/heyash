import "server-only";
import { Prisma, SessionStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { grantFreeIntro } from "@/lib/credits/ledger";
import { recomputeSession } from "@/lib/sessions/timer";
import { pusherServer, operatorChannelName, sessionChannelName } from "@/lib/realtime/pusher-server";
import { EVENTS, type SessionUpdatedPayload } from "@/lib/realtime/events";

export class AlreadyInConversationError extends Error {
  constructor() {
    super("You already have an active or waiting conversation");
    this.name = "AlreadyInConversationError";
  }
}

export class UserBlockedError extends Error {
  constructor() {
    super("This account has been blocked");
    this.name = "UserBlockedError";
  }
}

/** Creates a WAITING session. Billing has not started — an operator has to
 * accept it first. Grants the one-time free intro if this is the user's
 * first-ever session. */
export async function startConversation(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const activeBlock = await prisma.block.findFirst({
    where: { userId, liftedAt: null },
  });
  if (activeBlock) {
    throw new UserBlockedError();
  }

  const isFreeIntro = !user.hasUsedFreeIntro;
  if (isFreeIntro) {
    await grantFreeIntro(userId);
  }

  try {
    const session = await prisma.conversationSession.create({
      data: { userId, isFreeIntro, status: SessionStatus.WAITING },
    });
    await pusherServer.trigger(operatorChannelName(), EVENTS.SESSION_UPDATED, {
      status: session.status,
    } satisfies Partial<SessionUpdatedPayload>);
    return session;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // Raised by the one_active_session_per_user partial unique index.
      throw new AlreadyInConversationError();
    }
    throw error;
  }
}

export class SessionUnavailableError extends Error {
  constructor(message = "This conversation is no longer waiting") {
    super(message);
    this.name = "SessionUnavailableError";
  }
}

export class OperatorBusyError extends Error {
  constructor() {
    super("You already have an active conversation");
    this.name = "OperatorBusyError";
  }
}

export async function acceptConversation(sessionId: string, operatorId: string) {
  const now = new Date();
  const waitingSession = await prisma.conversationSession.findUniqueOrThrow({
    where: { id: sessionId },
  });
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: waitingSession.userId },
    select: { creditBalance: true },
  });

  try {
    const session = await prisma.conversationSession.update({
      where: { id: sessionId, status: SessionStatus.WAITING },
      data: {
        operatorId,
        status: SessionStatus.ACTIVE,
        startedAt: now,
        endsAt: new Date(now.getTime() + user.creditBalance * 60_000),
      },
    });
    await pusherServer.trigger(sessionChannelName(session.id), EVENTS.SESSION_UPDATED, {
      status: session.status,
      endsAt: session.endsAt?.toISOString() ?? null,
      startedAt: session.startedAt?.toISOString() ?? null,
      endReason: null,
    } satisfies SessionUpdatedPayload);
    return session;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") throw new SessionUnavailableError();
      if (error.code === "P2002") throw new OperatorBusyError();
    }
    throw error;
  }
}

export type EndReason = "user_ended" | "operator_ended" | "operator_declined";

export async function endConversation(sessionId: string, endReason: EndReason) {
  const session = await prisma.conversationSession.findUniqueOrThrow({
    where: { id: sessionId },
  });

  if (session.status === SessionStatus.ACTIVE) {
    // Final billing tick so the last partial minute is accounted for.
    await recomputeSession(sessionId);
  }

  const current = await prisma.conversationSession.findUniqueOrThrow({ where: { id: sessionId } });
  if (current.status === SessionStatus.ENDED) {
    return current;
  }

  const updated = await prisma.conversationSession.update({
    where: { id: sessionId },
    data: { status: SessionStatus.ENDED, endedAt: new Date(), endReason },
  });
  await pusherServer.trigger(sessionChannelName(sessionId), EVENTS.SESSION_UPDATED, {
    status: updated.status,
    endsAt: updated.endsAt?.toISOString() ?? null,
    startedAt: updated.startedAt?.toISOString() ?? null,
    endReason: updated.endReason,
  } satisfies SessionUpdatedPayload);
  return updated;
}
