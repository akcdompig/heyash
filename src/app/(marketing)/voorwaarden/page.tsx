import { Card } from "@/components/ui/Card";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl">Gebruiksvoorwaarden</h1>
      <Card className="mt-8 space-y-4 text-sm leading-relaxed text-muted">
        <p>
          <strong className="text-foreground">Placeholder — juridisch nog te
          laten toetsen.</strong> Even Kletsen is uitsluitend bedoeld voor
          gebruikers van 18 jaar en ouder, voor gezellig, laagdrempelig
          contact. Het is nadrukkelijk geen therapie, geen medisch of
          psychologisch advies, geen crisishulp en geen datingdienst.
        </p>
        <p>
          Ashley is een echt persoon, geen hulpverlener. Bij acute nood of
          crisis verwijzen we door naar professionele hulpverlening — Even
          Kletsen is daar geen vervanging voor.
        </p>
        <p>
          Gesprekstijd wordt aangeschaft in minuten (credits) en per minuut
          verbruikt tijdens een actief gesprek. Volledige voorwaarden rondom
          betaling, restitutie en ongepast gebruik volgen hier na juridische
          toetsing.
        </p>
      </Card>
    </div>
  );
}
