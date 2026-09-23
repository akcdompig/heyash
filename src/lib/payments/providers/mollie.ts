import "server-only";
import { getPackage } from "@/lib/credits/packages";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  ProviderPaymentStatus,
} from "@/lib/payments/provider";

// Mollie Payments API v2. Reference: https://docs.mollie.com/reference/create-payment
//
// Unlike Tikkie, Mollie's hosted checkout does redirect the payer back to
// `redirectUrl` on its own, so this provider needs none of Tikkie's
// new-tab/opensInNewTab handling.
//
// Mollie's classic webhook (set via `webhookUrl` on the payment, as opposed
// to their newer, separately-configured signed webhooks) POSTs a single
// form-encoded `id` field and nothing else — no signature. Mollie's own docs
// treat that as fine: authenticity comes from fetching the payment back with
// your own API key, not from verifying the delivery. `verifyWebhookSignature`
// below is a no-op for the same reason it is in providers/tikkie.ts — the
// webhook route never trusts the delivery body, only the authenticated pull.

const API_BASE = "https://api.mollie.com/v2/";

interface MolliePayment {
  id: string;
  status: "open" | "pending" | "authorized" | "paid" | "canceled" | "expired" | "failed";
  amount: { currency: string; value: string };
  _links: { checkout?: { href: string } };
}

function apiKey(): string {
  const key = process.env.MOLLIE_API_KEY;
  if (!key) {
    throw new Error("MOLLIE_API_KEY must be set to use PAYMENT_PROVIDER=mollie");
  }
  return key;
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function mollieFetch<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Mollie API ${method} ${path} failed: ${res.status} ${detail}`);
  }
  return res.json() as Promise<T>;
}

function centsToValue(amountCents: number): string {
  return (amountCents / 100).toFixed(2);
}

export const mollieProvider: PaymentProvider = {
  id: "mollie",

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const pkg = getPackage(input.packageCode);
    const description = `Even Kletsen - ${pkg?.minutes ?? "?"} min`.slice(0, 255);

    const payment = await mollieFetch<MolliePayment>("POST", "payments", {
      amount: { currency: "EUR", value: centsToValue(input.amountCents) },
      description,
      redirectUrl: input.returnUrl,
      webhookUrl: `${appUrl()}/api/webhooks/mollie`,
      metadata: { localPaymentId: input.localPaymentId },
    });

    const checkoutUrl = payment._links.checkout?.href;
    if (!checkoutUrl) {
      throw new Error(`Mollie payment ${payment.id} has no checkout link`);
    }

    return { providerPaymentId: payment.id, redirectUrl: checkoutUrl };
  },

  async verifyPayment(providerPaymentId: string): Promise<ProviderPaymentStatus> {
    const payment = await mollieFetch<MolliePayment>("GET", `payments/${providerPaymentId}`);

    if (payment.status === "paid") return "SUCCEEDED";
    if (["failed", "expired", "canceled"].includes(payment.status)) return "FAILED";
    return "PENDING";
  },

  // See file header: Mollie's classic webhook carries no signature.
  verifyWebhookSignature(): boolean {
    return true;
  },

  parseWebhookPaymentId(rawBody: string): string {
    const id = new URLSearchParams(rawBody).get("id");
    if (!id) {
      throw new Error("Mollie webhook body missing id");
    }
    return id;
  },
};
