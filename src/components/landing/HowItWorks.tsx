const STEPS = [
  { n: "1", title: "Start", body: "Maak in een minuut een account aan — alleen je e-mailadres nodig." },
  { n: "2", title: "Praat 2 minuten gratis", body: "Geen betaalgegevens vooraf. Gewoon meteen kletsen." },
  { n: "3", title: "Koop extra gesprekstijd als je wilt", body: "Alleen als je door wilt praten. Jij bepaalt hoeveel." },
  { n: "4", title: "Praat zo lang als je nodig hebt", body: "Binnen je beschikbare tijd, zonder haast." },
];

export function HowItWorks() {
  return (
    <section className="bg-surface-tint/60 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center font-display text-3xl sm:text-4xl">Hoe werkt het?</h2>

        <ol className="mt-12 grid gap-6 sm:grid-cols-2">
          {STEPS.map((step) => (
            <li key={step.n} className="flex gap-4 rounded-2xl bg-surface p-6 shadow-soft">
              <span className="font-display text-2xl text-primary">{step.n}</span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
