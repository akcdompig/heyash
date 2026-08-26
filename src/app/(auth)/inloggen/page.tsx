import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { signInWithEmail } from "@/lib/actions/auth";

export default async function LoginPage({ searchParams }: PageProps<"/inloggen">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/verder";

  return (
    <Card className="w-full max-w-sm">
      <h1 className="font-display text-2xl">Welkom bij Even Kletsen</h1>
      <p className="mt-2 text-sm text-muted">
        Vul je e-mailadres in. We sturen je een inloglink — geen wachtwoord
        nodig.
      </p>

      <form action={signInWithEmail.bind(null, next)} className="mt-6 flex flex-col gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="jij@voorbeeld.nl"
          className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <Button type="submit" className="w-full">
          Stuur inloglink
        </Button>
      </form>
    </Card>
  );
}
