import { CREDIT_PACKAGES, formatPrice, pricePerMinute } from "@/lib/credits/packages";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createPaymentAction } from "@/lib/actions/payments";

interface PricingTableProps {
  purchasable?: boolean;
}

export function PricingTable({ purchasable = false }: PricingTableProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {CREDIT_PACKAGES.map((pkg) => (
        <div
          key={pkg.code}
          className={`relative flex flex-col rounded-2xl border p-6 ${
            pkg.popular
              ? "border-primary bg-surface shadow-lift"
              : "border-border bg-surface shadow-soft"
          }`}
        >
          {pkg.popular && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge tone="primary">Meest gekozen</Badge>
            </span>
          )}
          <p className="font-display text-3xl">{pkg.minutes}</p>
          <p className="text-sm text-muted">minuten</p>
          <p className="mt-4 text-2xl font-semibold">{formatPrice(pkg.priceCents)}</p>
          <p className="mt-1 text-xs text-muted">{pricePerMinute(pkg)} / minuut</p>

          {purchasable && (
            <form action={createPaymentAction.bind(null, pkg.code)} className="mt-6">
              <Button
                type="submit"
                variant={pkg.popular ? "primary" : "secondary"}
                className="w-full"
              >
                Kiezen
              </Button>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}
