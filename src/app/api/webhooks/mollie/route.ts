import { NextResponse } from "next/server";
import { mollieProvider } from "@/lib/payments/providers/mollie";
import { processPaymentWebhookEvent } from "@/lib/payments/process-webhook";

// Mollie's classic webhook is a bare "id=tr_xxx" ping — no status, no
// signature. Same pattern as the Tikkie webhook: never trust the delivery
// itself, only the authenticated verifyPayment() pull that follows it.
export async function POST(request: Request) {
  const rawBody = await request.text();

  let providerPaymentId: string;
  try {
    providerPaymentId = mollieProvider.parseWebhookPaymentId(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const status = await mollieProvider.verifyPayment(providerPaymentId);
  if (status === "PENDING") {
    return NextResponse.json({ received: true });
  }

  await processPaymentWebhookEvent({
    provider: mollieProvider.id,
    providerEventId: providerPaymentId,
    providerPaymentId,
    status,
    payload: { id: providerPaymentId },
  });

  return NextResponse.json({ received: true });
}
