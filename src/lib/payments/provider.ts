export interface CreatePaymentInput {
  /** Our own local Payment.id, created before the provider is called, so it
   * can be used as a correlation/reference id. */
  localPaymentId: string;
  packageCode: string;
  amountCents: number;
  returnUrl: string;
}

export interface CreatePaymentResult {
  providerPaymentId: string;
  redirectUrl: string;
}

export type ProviderPaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED";

/**
 * Every real provider (Mollie, etc.) implements this. `createUser`-style
 * credit granting is deliberately NOT part of this interface — it's a single
 * shared function in lib/credits/ledger.ts that every provider's webhook
 * handler calls, so the idempotent credit-granting logic is written once.
 */
export interface PaymentProvider {
  readonly id: string;

  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;

  /** Pull-based fallback — used by the client-facing status check and the
   * payment return page, in case a webhook is delayed. */
  verifyPayment(providerPaymentId: string): Promise<ProviderPaymentStatus>;

  /** Verifies the webhook actually came from the provider, before anything
   * else touches the request body. */
  verifyWebhookSignature(rawBody: string, headers: Headers): boolean;

  /** Parses a verified webhook body into the provider's payment id, so the
   * caller can look up the local Payment row. */
  parseWebhookPaymentId(rawBody: string): string;
}
