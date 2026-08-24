import "server-only";
import { mockProvider } from "@/lib/payments/providers/mock";
import type { PaymentProvider } from "@/lib/payments/provider";

export type { PaymentProvider, CreatePaymentInput, CreatePaymentResult } from "@/lib/payments/provider";

// Lazy on purpose: this must only be evaluated when a request actually
// handles a payment, not at module-load time. next build's page-data
// collection imports every route module with NODE_ENV=production, which
// would trip the mock-in-production guard below during the build itself if
// this ran eagerly at import time.
export function getPaymentProvider(): PaymentProvider {
  const configured = process.env.PAYMENT_PROVIDER ?? "mock";

  if (configured === "mock") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "PAYMENT_PROVIDER=mock is not allowed in production — set a real provider."
      );
    }
    return mockProvider;
  }

  throw new Error(
    `Unknown PAYMENT_PROVIDER "${configured}". Add its implementation under lib/payments/providers/ and register it here.`
  );
}
