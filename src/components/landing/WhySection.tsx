const POINTS = [
  {
    title: "Geen oordeel",
    body: "Je hoeft niets uit te leggen of te verantwoorden. Praat over wat er in je opkomt.",
  },
  {
    title: "Een echt mens",
    body: "Geen chatbot, geen script. Gewoon Ashley, die luistert en reageert zoals een mens dat doet.",
  },
  {
    title: "Wanneer het jou uitkomt",
    body: "Geen afspraak nodig. Begin een gesprek op het moment dat jij daar behoefte aan hebt.",
  },
];

export function WhySection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <div className="text-center">
        <h2 className="font-display text-3xl sm:text-4xl">Waarom Even Kletsen?</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          Soms heb je geen advies nodig. Soms wil je gewoon dat iemand
          luistert.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {POINTS.map((point) => (
          <div key={point.title} className="rounded-2xl bg-surface-tint p-6">
            <h3 className="font-display text-lg">{point.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{point.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
