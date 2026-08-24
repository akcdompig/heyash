export interface CreditPackage {
  code: string;
  minutes: number;
  priceCents: number;
  popular?: boolean;
}

export const FREE_INTRO_MINUTES = 2;

export const CREDIT_PACKAGES: CreditPackage[] = [
  { code: "5min", minutes: 5, priceCents: 300 },
  { code: "15min", minutes: 15, priceCents: 750 },
  { code: "30min", minutes: 30, priceCents: 1400 },
  { code: "60min", minutes: 60, priceCents: 2500, popular: true },
  { code: "120min", minutes: 120, priceCents: 4500 },
];

export function getPackage(code: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((p) => p.code === code);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function pricePerMinute(pkg: CreditPackage): string {
  return formatPrice(pkg.priceCents / pkg.minutes);
}
