import { notFound } from "next/navigation";
import { requireAgeConfirmed } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { ChatRoom } from "@/components/chat/ChatRoom";

export default async function ChatSessionPage({ params }: PageProps<"/chat/[id]">) {
  const user = await requireAgeConfirmed();
  const { id } = await params;

  const session = await prisma.conversationSession.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!session || session.userId !== user.id) {
    notFound();
  }

  return (
    <ChatRoom
      sessionId={session.id}
      viewerRole="USER"
      headerTitle="Ashley"
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
    />
  );
}
