import { notFound } from "next/navigation";
import { requireOperator } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { SafetyActionsMenu } from "@/components/operator/SafetyActionsMenu";

export default async function OperatorSessionPage({ params }: PageProps<"/dashboard/[sessionId]">) {
  const operator = await requireOperator();
  const { sessionId } = await params;

  const session = await prisma.conversationSession.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!session || (session.operatorId !== operator.id && operator.role !== "ADMIN")) {
    notFound();
  }

  return (
    <ChatRoom
      sessionId={session.id}
      viewerRole="OPERATOR"
      headerTitle={session.isFreeIntro ? "Gratis introductie" : "Gesprek"}
      isFreeIntro={session.isFreeIntro}
      initialStatus={session.status}
      initialEndsAt={session.endsAt?.toISOString() ?? null}
      initialStartedAt={session.startedAt?.toISOString() ?? null}
      initialEndReason={session.endReason}
      initialMessages={session.messages.map((m) => ({
        id: m.id,
        senderRole: m.senderRole,
        body: m.body ?? "",
        createdAt: m.createdAt.toISOString(),
      }))}
      extraActions={<SafetyActionsMenu sessionId={session.id} userId={session.userId} />}
    />
  );
}
