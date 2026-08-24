import { redirect } from "next/navigation";
import { requireAgeConfirmed } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { SessionStatus } from "@prisma/client";
import { startConversationAction } from "@/lib/actions/session";
import { Button } from "@/components/ui/Button";
import { AshleyAvatar } from "@/components/landing/AshleyAvatar";

export default async function ChatEntryPage({ searchParams }: PageProps<"/chat">) {
  const user = await requireAgeConfirmed();
  const sp = await searchParams;

  const existing = await prisma.conversationSession.findFirst({
    where: {
      userId: user.id,
      status: { in: [SessionStatus.WAITING, SessionStatus.ACTIVE, SessionStatus.GRACE] },
    },
  });
  if (existing) {
    redirect(`/chat/${existing.id}`);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <AshleyAvatar size={80} />

      {sp.blocked && (
        <p className="max-w-sm rounded-xl bg-warning/15 px-4 py-3 text-sm text-warning-strong">
          Je account is geblokkeerd voor nieuwe gesprekken.
        </p>
      )}

      {user.hasUsedFreeIntro ? (
        <>
          <h1 className="font-display text-3xl">Klaar om te kletsen?</h1>
          <p className="max-w-sm text-muted">
            Je hebt nog {user.creditBalance} {user.creditBalance === 1 ? "minuut" : "minuten"} gesprekstijd
            beschikbaar.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-display text-3xl">Zin om even te kletsen? 💛</h1>
          <p className="max-w-sm text-muted">Je kunt eerst 2 minuten gratis met Ashley praten.</p>
        </>
      )}

      <form action={startConversationAction}>
        <Button size="lg" disabled={user.hasUsedFreeIntro && user.creditBalance <= 0}>
          {user.hasUsedFreeIntro ? "Start gesprek" : "Start mijn gratis gesprek"}
        </Button>
      </form>

      {user.hasUsedFreeIntro && user.creditBalance <= 0 && (
        <a href="/buy" className="text-sm text-primary underline underline-offset-2">
          Koop eerst wat gesprekstijd
        </a>
      )}
    </div>
  );
}
