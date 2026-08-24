import { requireUser } from "@/lib/auth/dal";
import { confirmAgeAction } from "@/lib/actions/account";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// This is a self-declaration, not verified age assurance. It's built as its
// own step/route (rather than a checkbox bundled into signup) precisely so a
// stronger verification provider can be dropped in here later without
// touching the rest of the auth flow — see project notes on age
// verification.
export default async function ConfirmAgePage() {
  await requireUser();

  return (
    <Card className="w-full max-w-sm text-center">
      <Badge tone="primary">18+</Badge>
      <h1 className="mt-4 font-display text-2xl">Eventjes checken</h1>
      <p className="mt-3 text-sm text-muted">
        Even Kletsen is alleen bedoeld voor volwassenen. Voordat je verder
        gaat, willen we dat je bevestigt dat je 18 jaar of ouder bent.
      </p>

      <form action={confirmAgeAction} className="mt-6">
        <label className="flex items-start gap-3 rounded-xl bg-surface-tint p-4 text-left text-sm">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
          />
          <span>Ik bevestig dat ik 18 jaar of ouder ben.</span>
        </label>
        <Button type="submit" className="mt-5 w-full">
          Verder
        </Button>
      </form>
    </Card>
  );
}
