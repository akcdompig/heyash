import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";
import { getPaymentProvider } from "@/lib/payments";

export async function GET(_request: Request, { params }: RouteContext<"/api/payments/[id]/status">) {
  const user = await requireUser();
  const { id } = await params;

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment || payment.userId !== user.id) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  // Read-only fallback: if a webhook hasn't landed yet, ask the provider
  // directly. This endpoint can never itself grant credit — it only ever
  // reports what's already true in the database, or nudges verifyPayment()
  // as a side-effect-free lookup. Actual crediting happens exclusively via
  // the webhook path in lib/payments/process-webhook.ts.
  if (payment.status === "PENDING") {
    await getPaymentProvider().verifyPayment(payment.providerPaymentId);
  }

  return NextResponse.json({ status: payment.status });
}
