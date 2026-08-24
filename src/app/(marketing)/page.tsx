import { Hero } from "@/components/landing/Hero";
import { WhySection } from "@/components/landing/WhySection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingTable } from "@/components/landing/PricingTable";
import { AshleyProfile } from "@/components/landing/AshleyProfile";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <WhySection />
      <HowItWorks />

      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl">Transparante prijzen</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            1 credit staat gelijk aan 1 minuut gesprekstijd. Hoe groter het
            pakket, hoe lager de prijs per minuut.
          </p>
        </div>
        <div className="mt-12">
          <PricingTable />
        </div>
      </section>

      <AshleyProfile />
    </>
  );
}
