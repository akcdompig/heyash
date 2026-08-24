import { requireUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { PaymentStatusPoller } from "@/components/buy/PaymentStatusPoller";

export default async function ThankYouPage({ searchParams }: PageProps<"/buy/bedankt">) {
  const user = await requireUser();
  const sp = await searchParams;
  const paymentId = typeof sp.payment === "string" ? sp.payment : undefined;

  const payment = paymentId
    ? await prisma.payment.findFirst({ where: { id: paymentId, userId: user.id } })
    : null;

  if (!payment) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-6">
        <Card className="w-full text-center">
          <p>We konden deze betaling niet vinden.</p>
          <LinkButton href="/buy" className="mt-4">
            Terug naar prijzen
          </LinkButton>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-6">
      <Card className="w-full text-center">
        {payment.status === "SUCCEEDED" && (
          <>
            <h1 className="font-display text-2xl">Gelukt! 💛</h1>
            <p className="mt-3 text-sm text-muted">
              Je gesprekstijd is toegevoegd. Je kunt weer verder kletsen.
            </p>
            <LinkButton href="/chat" className="mt-6">
              Verder kletsen
            </LinkButton>
          </>
        )}
        {payment.status === "FAILED" && (
          <>
            <h1 className="font-display text-2xl">Dat ging niet goed</h1>
            <p className="mt-3 text-sm text-muted">
              Je betaling is niet gelukt. Er is niets afgeschreven.
            </p>
            <LinkButton href="/buy" className="mt-6">
              Probeer opnieuw
            </LinkButton>
          </>
        )}
        {payment.status === "PENDING" && (
          <>
            <h1 className="font-display text-2xl">Even geduld…</h1>
            <p className="mt-3 text-sm text-muted">
              We bevestigen je betaling. Dit duurt meestal maar een paar
              seconden.
            </p>
            <PaymentStatusPoller paymentId={payment.id} />
          </>
        )}
      </Card>
    </div>
  );
}
