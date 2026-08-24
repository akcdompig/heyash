"use server";

import { redirect } from "next/navigation";
import { requireAgeConfirmed } from "@/lib/auth/dal";
import { startConversation, AlreadyInConversationError, UserBlockedError } from "@/lib/sessions/state";
import { prisma } from "@/lib/db/prisma";
import { SessionStatus } from "@prisma/client";

export async function startConversationAction() {
  const user = await requireAgeConfirmed();

  try {
    const session = await startConversation(user.id);
    redirect(`/chat/${session.id}`);
  } catch (error) {
    if (error instanceof AlreadyInConversationError) {
      const existing = await prisma.conversationSession.findFirst({
        where: {
          userId: user.id,
          status: { in: [SessionStatus.WAITING, SessionStatus.ACTIVE, SessionStatus.GRACE] },
        },
      });
      if (existing) {
        redirect(`/chat/${existing.id}`);
      }
    }
    if (error instanceof UserBlockedError) {
      redirect("/chat?blocked=1");
    }
    throw error;
  }
}
