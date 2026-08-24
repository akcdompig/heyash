import { NextResponse } from "next/server";
import { z } from "zod";
import { SessionStatus } from "@prisma/client";
import { requireOperator } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { endConversation } from "@/lib/sessions/state";

const bodySchema = z.object({
  userId: z.string(),
  reason: z.string().trim().max(2000).optional(),
});

export async function POST(request: Request) {
  const operator = await requireOperator();
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }
  const { userId, reason } = parsed.data;

  const block = await prisma.block.create({
    data: { userId, blockedByUserId: operator.id, reason },
  });

  const liveSessions = await prisma.conversationSession.findMany({
    where: { userId, status: { in: [SessionStatus.WAITING, SessionStatus.ACTIVE, SessionStatus.GRACE] } },
    select: { id: true },
  });
  await Promise.all(liveSessions.map((s) => endConversation(s.id, "operator_ended")));

  return NextResponse.json({ id: block.id });
}
