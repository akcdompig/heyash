"use server";

import { redirect } from "next/navigation";
import { requireOperator } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import {
  acceptConversation,
  endConversation,
  SessionUnavailableError,
  OperatorBusyError,
} from "@/lib/sessions/state";

export async function acceptConversationAction(sessionId: string) {
  const operator = await requireOperator();

  try {
    await acceptConversation(sessionId, operator.id);
  } catch (error) {
    if (error instanceof SessionUnavailableError || error instanceof OperatorBusyError) {
      redirect("/dashboard");
    }
    throw error;
  }

  redirect(`/dashboard/${sessionId}`);
}

export async function declineConversationAction(sessionId: string) {
  await requireOperator();

  const session = await prisma.conversationSession.findUnique({ where: { id: sessionId } });
  if (session?.status === "WAITING") {
    await endConversation(sessionId, "operator_declined");
  }

  redirect("/dashboard");
}
