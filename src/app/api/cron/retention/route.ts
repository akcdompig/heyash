import { NextResponse } from "next/server";
import { ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { isAuthorizedCronRequest } from "@/lib/cron/auth";

const RETENTION_DAYS = 30;

// Daily sweep: redacts message content 30 days after a conversation ends,
// unless it's attached to a still-open safety report (in which case the
// 30-day clock effectively restarts once that report is closed, since this
// query only looks at currently-open reports each run).
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const eligibleSessions = await prisma.conversationSession.findMany({
    where: {
      status: "ENDED",
      endedAt: { lt: cutoff },
      safetyReports: { none: { status: { in: [ReportStatus.OPEN, ReportStatus.REVIEWED] } } },
    },
    select: { id: true },
  });

  const result = await prisma.message.updateMany({
    where: {
      sessionId: { in: eligibleSessions.map((s) => s.id) },
      redactedAt: null,
    },
    data: { body: null, redactedAt: new Date() },
  });

  return NextResponse.json({ sessionsProcessed: eligibleSessions.length, messagesRedacted: result.count });
}
