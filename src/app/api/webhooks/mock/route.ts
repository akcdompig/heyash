import { NextResponse } from "next/server";
import { mockProvider, type MockWebhookBody } from "@/lib/payments/providers/mock";
import { processPaymentWebhookEvent } from "@/lib/payments/process-webhook";

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!mockProvider.verifyWebhookSignature(rawBody, request.headers)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody) as MockWebhookBody;

  await processPaymentWebhookEvent({
    provider: mockProvider.id,
    providerEventId: body.eventId,
    providerPaymentId: body.providerPaymentId,
    status: body.status,
    payload: body,
  });

  return NextResponse.json({ received: true });
}
