import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { endConversation } from "@/lib/sessions/state";

export async function POST(_request: Request, { params }: RouteContext<"/api/session/[id]/end">) {
  const user = await requireUser();
  const { id } = await params;

  const session = await prisma.conversationSession.findUnique({ where: { id } });
  if (!session) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  const isParticipant = session.userId === user.id || session.operatorId === user.id;
  if (!isParticipant && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const endReason = session.operatorId === user.id ? "operator_ended" : "user_ended";
  const updated = await endConversation(id, endReason);
  return NextResponse.json({ status: updated.status });
}
