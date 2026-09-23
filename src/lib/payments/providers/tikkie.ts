import "server-only";
import { getPackage } from "@/lib/credits/packages";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  ProviderPaymentStatus,
} from "@/lib/payments/provider";

// Tikkie API v2 (ABN AMRO). Reference: https://developer.abnamro.com/api-products/tikkie
//
// Two things make this provider shaped differently from a typical checkout
// integration:
//
// 1. A Tikkie payment request has no "return URL" — ABN AMRO never redirects
//    the payer back to us after they pay. `createPayment` sets
//    `opensInNewTab: true` so the caller opens the Tikkie page in a separate
//    tab instead of navigating away from the app; the original tab keeps
//    polling/listening (Pusher, /api/payments/[id]/status) and picks up the
//    result on its own.
// 2. Tikkie's webhook notification carries no status and no signature — just
//    a paymentRequestToken/paymentToken pointer. So `verifyWebhookSignature`
//    below is intentionally a no-op: the real trust boundary is that the
//    webhook route never trusts the notification body's claims, it only uses
//    the notification as a nudge to call verifyPayment(), which pulls the
//    authoritative paid amount from Tikkie using our own API credentials.
//    Credit is only ever granted based on that authenticated pull.

const SANDBOX_API_URL = "https://api-sandbox.abnamro.com/v2/tikkie/";
const PRODUCTION_API_URL = "https://api.abnamro.com/v2/tikkie/";

interface TikkiePaymentRequest {
  paymentRequestToken: string;
  url: string;
  amountInCents?: number;
  status: "OPEN" | "CLOSED" | "EXPIRED" | "MAX_YIELD_REACHED" | "MAX_SUCCESSFUL_PAYMENTS_REACHED";
  totalAmountPaidInCents?: number;
}

interface TikkieNotificationBody {
  subscriptionId?: string;
  notificationType?: string;
  paymentRequestToken?: string;
  paymentToken?: string;
}

function config() {
  const apiKey = process.env.TIKKIE_API_KEY;
  const appToken = process.env.TIKKIE_APP_TOKEN;
  if (!apiKey || !appToken) {
    throw new Error("TIKKIE_API_KEY and TIKKIE_APP_TOKEN must be set to use PAYMENT_PROVIDER=tikkie");
  }
  const sandbox = process.env.TIKKIE_SANDBOX === "true";
  return { apiKey, appToken, baseUrl: sandbox ? SANDBOX_API_URL : PRODUCTION_API_URL };
}

async function tikkieFetch<T>(
  method: "GET" | "POST",
  path: string,
  body?: unknown
): Promise<T> {
  const { apiKey, appToken, baseUrl } = config();

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Api-Key": apiKey,
      "X-App-Token": appToken,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Tikkie API ${method} ${path} failed: ${res.status} ${detail}`);
  }
  return res.json() as Promise<T>;
}

function tomorrowIso(): string {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export const tikkieProvider: PaymentProvider = {
  id: "tikkie",

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const pkg = getPackage(input.packageCode);
    const description = `Even Kletsen - ${pkg?.minutes ?? "?"} min`.slice(0, 35);

    const created = await tikkieFetch<TikkiePaymentRequest>("POST", "paymentrequests", {
      amountInCents: input.amountCents,
      description,
      expiryDate: tomorrowIso(),
      referenceId: input.localPaymentId,
    });

    return {
      providerPaymentId: created.paymentRequestToken,
      redirectUrl: created.url,
      opensInNewTab: true,
    };
  },

  async verifyPayment(providerPaymentId: string): Promise<ProviderPaymentStatus> {
    const request = await tikkieFetch<TikkiePaymentRequest>(
      "GET",
      `paymentrequests/${providerPaymentId}`
    );

    const paid = request.totalAmountPaidInCents ?? 0;
    const expected = request.amountInCents ?? Infinity;
    if (paid >= expected) {
      return "SUCCEEDED";
    }
    if (request.status === "EXPIRED") {
      return "FAILED";
    }
    return "PENDING";
  },

  // See file header: Tikkie's v2 business API notifications carry no
  // signature to check. Safety comes from never trusting this body's
  // contents — only from the authenticated verifyPayment() pull.
  verifyWebhookSignature(): boolean {
    return true;
  },

  parseWebhookPaymentId(rawBody: string): string {
    const body = JSON.parse(rawBody) as TikkieNotificationBody;
    if (body.notificationType !== "PAYMENT" || !body.paymentRequestToken) {
      throw new Error(`Unsupported Tikkie notification: ${body.notificationType}`);
    }
    return body.paymentRequestToken;
  },
};

/** One-off setup call, not part of the request path: registers our webhook
 * URL as Tikkie's single notification destination for this app. Run once
 * per environment (sandbox and production separately) after credentials are
 * issued — see scripts/register-tikkie-webhook.ts. */
export async function registerTikkieWebhook(notificationUrl: string): Promise<{ subscriptionId: string }> {
  return tikkieFetch<{ subscriptionId: string }>("POST", "paymentrequestssubscription", {
    url: notificationUrl,
  });
}
