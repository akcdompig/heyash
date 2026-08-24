import Link from "next/link";
import { requireOperator } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { SessionStatus } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OperatorQueueWatcher } from "@/components/operator/OperatorQueueWatcher";
import { SafetyActionsMenu } from "@/components/operator/SafetyActionsMenu";
import { acceptConversationAction, declineConversationAction } from "@/lib/actions/operator";

export default async function OperatorDashboardPage() {
  const operator = await requireOperator();

  const [activeSession, waitingSessions] = await Promise.all([
    prisma.conversationSession.findFirst({
      where: { operatorId: operator.id, status: SessionStatus.ACTIVE },
    }),
    prisma.conversationSession.findMany({
      where: { status: SessionStatus.WAITING },
      orderBy: { requestedAt: "asc" },
      include: { user: { select: { creditBalance: true } } },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <OperatorQueueWatcher />
      <h1 className="font-display text-2xl">Wachtrij</h1>

      {activeSession && (
        <Card className="mt-6 border-primary">
          <p className="text-sm text-muted">Je hebt een actief gesprek</p>
          <Link href={`/dashboard/${activeSession.id}`}>
            <Button className="mt-3">Ga naar gesprek</Button>
          </Link>
        </Card>
      )}

      <div className="mt-6 space-y-3">
        {waitingSessions.length === 0 && (
          <p className="text-sm text-muted">Niemand aan het wachten op dit moment.</p>
        )}
        {waitingSessions.map((session) => (
          <Card key={session.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg">💛 Nieuwe aanvraag</p>
                <p className="mt-1 text-sm text-muted">Iemand wil graag even met je kletsen.</p>
                <p className="mt-2 text-xs text-muted">
                  {session.isFreeIntro ? "Gratis introductie" : `${session.user.creditBalance} min beschikbaar`}
                  {" · "}
                  Wacht sinds{" "}
                  {session.requestedAt.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <SafetyActionsMenu sessionId={session.id} userId={session.userId} />
            </div>

            <div className="mt-4 flex gap-2">
              <form action={acceptConversationAction.bind(null, session.id)}>
                <Button type="submit" disabled={!!activeSession} size="md">
                  Accepteren
                </Button>
              </form>
              <form action={declineConversationAction.bind(null, session.id)}>
                <Button type="submit" variant="secondary" size="md">
                  Afwijzen
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
