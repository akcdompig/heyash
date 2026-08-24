import { NextResponse } from "next/server";
import { z } from "zod";
import { SessionStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { recomputeSession } from "@/lib/sessions/timer";
import { pusherServer, sessionChannelName } from "@/lib/realtime/pusher-server";
import { EVENTS, type MessageNewPayload } from "@/lib/realtime/events";

const bodySchema = z.object({
  sessionId: z.string(),
  body: z.string().trim().min(1).max(2000),
});

export async function POST(request: Request) {
  const user = await requireUser();
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }
  const { sessionId, body } = parsed.data;

  const session = await prisma.conversationSession.findUnique({ where: { id: sessionId } });
  if (!session) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }
  const isParticipant = session.userId === user.id || session.operatorId === user.id;
  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.status !== SessionStatus.ACTIVE) {
    return NextResponse.json({ error: "Dit gesprek is niet actief" }, { status: 409 });
  }

  // Billing tick first: if this message would land after time actually ran
  // out, recomputeSession flips the session to GRACE and the send below is
  // rejected instead of squeezing in one more "free" message.
  const updated = await recomputeSession(sessionId);
  if (updated.status !== SessionStatus.ACTIVE) {
    return NextResponse.json({ error: "Je gesprekstijd is op" }, { status: 409 });
  }

  const message = await prisma.message.create({
    data: { sessionId, senderRole: user.role, body },
  });

  const payload: MessageNewPayload = {
    id: message.id,
    senderRole: message.senderRole,
    body: message.body ?? "",
    createdAt: message.createdAt.toISOString(),
  };
  await pusherServer.trigger(sessionChannelName(sessionId), EVENTS.MESSAGE_NEW, payload);

  return NextResponse.json(payload);
}
