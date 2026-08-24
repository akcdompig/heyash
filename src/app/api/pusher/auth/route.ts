import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { pusherServer } from "@/lib/realtime/pusher-server";

// This IS the per-user access-control boundary for chat: a subscription is
// only authorized if the requesting user is a participant (or an operator)
// on the exact conversation the channel name encodes. Nobody can subscribe
// to someone else's conversation, regardless of whether they can guess a
// session id.
export async function POST(request: Request) {
  const user = await requireUser();

  const form = await request.formData();
  const socketId = form.get("socket_id");
  const channelName = form.get("channel_name");

  if (typeof socketId !== "string" || typeof channelName !== "string") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const authorized = await isAuthorized(user, channelName);
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const authResponse = pusherServer.authorizeChannel(socketId, channelName);
  return NextResponse.json(authResponse);
}

async function isAuthorized(
  user: { id: string; role: string },
  channelName: string
): Promise<boolean> {
  if (channelName === "private-operator-queue") {
    return user.role === "OPERATOR" || user.role === "ADMIN";
  }

  const match = channelName.match(/^private-session-(.+)$/);
  if (!match) return false;
  const sessionId = match[1];

  const session = await prisma.conversationSession.findUnique({
    where: { id: sessionId },
    select: { userId: true, operatorId: true },
  });
  if (!session) return false;

  return (
    session.userId === user.id ||
    session.operatorId === user.id ||
    user.role === "ADMIN"
  );
}
