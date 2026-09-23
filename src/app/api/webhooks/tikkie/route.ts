import { NextResponse } from "next/server";
import { tikkieProvider } from "@/lib/payments/providers/tikkie";
import { processPaymentWebhookEvent } from "@/lib/payments/process-webhook";

interface TikkieNotificationBody {
  notificationType?: string;
  paymentRequestToken?: string;
  paymentToken?: string;
}

// Tikkie's notification is just a "something happened" nudge — no status, no
// signature. We never trust its content: verifyPayment() below re-fetches
// the authoritative paid amount from Tikkie using our own API credentials,
// and only that result is ever used to grant credit. See providers/tikkie.ts.
export async function POST(request: Request) {
  const rawBody = await request.text();

  let body: TikkieNotificationBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (body.notificationType !== "PAYMENT" || !body.paymentRequestToken || !body.paymentToken) {
    // Ignore notification types we don't handle (e.g. refunds) rather than
    // erroring — Tikkie would otherwise keep retrying a delivery we can
    // never succeed at.
    return NextResponse.json({ received: true });
  }

  const status = await tikkieProvider.verifyPayment(body.paymentRequestToken);
  if (status === "PENDING") {
    return NextResponse.json({ received: true });
  }

  await processPaymentWebhookEvent({
    provider: tikkieProvider.id,
    providerEventId: body.paymentToken,
    providerPaymentId: body.paymentRequestToken,
    status,
    payload: body,
  });

  return NextResponse.json({ received: true });
}
