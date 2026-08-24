import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AshleyAvatar } from "@/components/landing/AshleyAvatar";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--color-accent)" }}
      />
      <div
        className="pointer-events-none absolute top-40 left-[-15%] h-[320px] w-[320px] rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--color-secondary)" }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
        <AshleyAvatar size={72} />

        <h1 className="mt-8 font-display text-5xl leading-[1.05] sm:text-6xl">
          Even Kletsen
        </h1>

        <p className="mt-5 text-xl text-foreground/90 sm:text-2xl">
          Soms wil je gewoon even met iemand praten.
        </p>

        <p className="mt-4 max-w-md text-base text-muted sm:text-lg">
          Geen oordeel. Geen druk. Gewoon even gezellig kletsen met Ashley.
        </p>

        <div className="mt-9 flex flex-col items-center gap-4">
          <LinkButton href="/chat" size="lg">
            Even kletsen
          </LinkButton>
          <div className="flex items-center gap-2">
            <Badge tone="primary">18+</Badge>
            <Badge tone="secondary">Eerste 2 minuten gratis</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
