import { Card } from "@/components/ui/Card";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl">Privacybeleid</h1>
      <Card className="mt-8 space-y-4 text-sm leading-relaxed text-muted">
        <p>
          <strong className="text-foreground">Placeholder — juridisch nog te
          laten toetsen.</strong> Deze pagina beschrijft later het volledige
          privacybeleid van Even Kletsen: welke gegevens we verzamelen
          (minimaal: je e-mailadres, gesprekssessies en betaalgegevens),
          waarom, hoe lang we ze bewaren, en welke rechten je hebt (inzage,
          correctie, verwijdering).
        </p>
        <p>
          Berichtinhoud wordt standaard verwijderd 30 dagen na afloop van een
          gesprek, tenzij een gesprek onderdeel is van een openstaande
          veiligheidsmelding. Betaal- en transactiegegevens worden apart en
          langer bewaard voor de boekhouding.
        </p>
        <p>
          Voor vragen: neem contact op via de contactgegevens die hier na
          juridische toetsing worden toegevoegd.
        </p>
      </Card>
    </div>
  );
}
