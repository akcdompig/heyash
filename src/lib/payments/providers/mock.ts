import "server-only";
import crypto from "node:crypto";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  ProviderPaymentStatus,
} from "@/lib/payments/provider";

// Not a real payment integration — this is the interface's dev/testing
// implementation. It redirects to an in-app mock checkout page where a
// developer clicks "succeed" or "fail", which POSTs to /api/webhooks/mock
// with an HMAC signature, exactly like a real provider's webhook would.
const MOCK_SECRET = process.env.AUTH_SECRET ?? "mock-secret-dev-only";

export interface MockWebhookBody {
  providerPaymentId: string;
  eventId: string;
  status: "SUCCEEDED" | "FAILED";
}

export const mockProvider: PaymentProvider = {
  id: "mock",

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const providerPaymentId = `mock_${input.localPaymentId}`;
    const redirectUrl = `${appUrl()}/betalen/mock/${providerPaymentId}?returnUrl=${encodeURIComponent(
      input.returnUrl
    )}&amount=${input.amountCents}`;
    return { providerPaymentId, redirectUrl };
  },

  async verifyPayment(): Promise<ProviderPaymentStatus> {
    // The mock flow always resolves via the webhook (POST from the mock
    // checkout page), mirroring how real providers work. The pull path is
    // implemented for interface completeness and always reports pending.
    return "PENDING";
  },

  verifyWebhookSignature(rawBody: string, headers: Headers): boolean {
    const signature = headers.get("x-mock-signature");
    if (!signature) return false;
    const expected = crypto.createHmac("sha256", MOCK_SECRET).update(rawBody).digest("hex");
    return timingSafeEqual(signature, expected);
  },

  parseWebhookPaymentId(rawBody: string): string {
    const body = JSON.parse(rawBody) as MockWebhookBody;
    return body.providerPaymentId;
  },
};

export function signMockWebhookBody(rawBody: string): string {
  return crypto.createHmac("sha256", MOCK_SECRET).update(rawBody).digest("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
