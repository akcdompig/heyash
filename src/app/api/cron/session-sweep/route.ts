import { NextResponse } from "next/server";
import { SessionStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { recomputeSession } from "@/lib/sessions/timer";
import { isAuthorizedCronRequest } from "@/lib/cron/auth";

// Safety net for tabs that go idle without heartbeating (heartbeat + every
// chat message already trigger the same recompute in the normal case).
// Runs once daily (vercel.json) — Vercel's Hobby plan only allows daily cron
// jobs, so this can't run every minute as originally designed. Billing
// correctness doesn't depend on this running often: recompute is wall-clock
// delta-driven and self-corrects whenever it does run, even hours late. The
// only cost of the lower frequency is a truly abandoned session may show as
// still ACTIVE on the operator dashboard for longer than ideal.
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sessions = await prisma.conversationSession.findMany({
    where: { status: { in: [SessionStatus.ACTIVE, SessionStatus.GRACE] } },
    select: { id: true },
  });

  await Promise.all(sessions.map((s) => recomputeSession(s.id)));

  return NextResponse.json({ swept: sessions.length });
}
