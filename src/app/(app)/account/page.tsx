import { requireUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { deleteAccountAction } from "@/lib/actions/account";

const TX_LABELS: Record<string, string> = {
  PURCHASE: "Aankoop",
  USAGE: "Gesprek",
  REFUND: "Terugbetaling",
  FREE_INTRO: "Gratis introductie",
};

export default async function AccountPage() {
  const user = await requireUser();

  const [transactions, sessions] = await Promise.all([
    prisma.creditTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.conversationSession.findMany({
      where: { userId: user.id, status: "ENDED" },
      orderBy: { requestedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl">Jouw account</h1>

      <Card className="mt-6">
        <p className="text-sm text-muted">Beschikbare gesprekstijd</p>
        <p className="mt-1 font-display text-4xl">{user.creditBalance} min</p>
        <a href="/buy" className="mt-4 inline-block">
          <Button size="md">Meer tijd kopen</Button>
        </a>
      </Card>

      <section className="mt-8">
        <h2 className="font-semibold">Transacties</h2>
        <Card className="mt-3 divide-y divide-border p-0">
          {transactions.length === 0 && (
            <p className="p-6 text-sm text-muted">Nog geen transacties.</p>
          )}
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between px-6 py-4 text-sm">
              <div>
                <p>{TX_LABELS[tx.type] ?? tx.type}</p>
                <p className="text-muted">{tx.createdAt.toLocaleDateString("nl-NL")}</p>
              </div>
              <p className={tx.amountMinutes >= 0 ? "text-secondary-hover" : "text-muted"}>
                {tx.amountMinutes >= 0 ? "+" : ""}
                {tx.amountMinutes} min
              </p>
            </div>
          ))}
        </Card>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">Eerdere gesprekken</h2>
        <Card className="mt-3 divide-y divide-border p-0">
          {sessions.length === 0 && (
            <p className="p-6 text-sm text-muted">Nog geen eerdere gesprekken.</p>
          )}
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-6 py-4 text-sm">
              <p>{s.requestedAt.toLocaleDateString("nl-NL")}</p>
              <p className="text-muted">{s.minutesDebited} min</p>
            </div>
          ))}
        </Card>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="font-semibold text-danger">Account verwijderen</h2>
        <p className="mt-2 text-sm text-muted">
          Je account en toegang worden direct verwijderd. Betaalgegevens
          bewaren we voor de boekhouding, los van je account.
        </p>
        <form action={deleteAccountAction} className="mt-4">
          <Button type="submit" variant="danger">
            Account verwijderen
          </Button>
        </form>
      </section>
    </div>
  );
}
