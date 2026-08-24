import { requireUser } from "@/lib/auth/dal";
import { PricingTable } from "@/components/landing/PricingTable";

export default async function BuyPage() {
  await requireUser();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl">Gesprekstijd kopen</h1>
      <p className="mt-2 text-muted">
        1 credit staat gelijk aan 1 minuut. Hoe groter het pakket, hoe lager
        de prijs per minuut.
      </p>
      <div className="mt-8">
        <PricingTable purchasable />
      </div>
    </div>
  );
}
