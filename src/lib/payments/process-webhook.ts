import "server-only";
import { Prisma, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { grantPurchase } from "@/lib/credits/ledger";
import { getPackage } from "@/lib/credits/packages";
import { tryResumeGraceSession } from "@/lib/sessions/timer";

interface ProcessWebhookInput {
  provider: string;
  providerEventId: string;
  providerPaymentId: string;
  status: "SUCCEEDED" | "FAILED";
  payload: unknown;
}

/**
 * Shared by every provider's webhook route. Safe to call more than once with
 * the same event: the dedupe insert makes a replayed delivery a no-op, and
 * the Payment.status guard makes a duplicate "succeeded" a no-op even if the
 * dedupe row were somehow missing. Credits are granted exactly once via
 * ledger.ts's own idempotency key (`payment-credit-{paymentId}`).
 */
export async function processPaymentWebhookEvent(input: ProcessWebhookInput) {
  const { provider, providerEventId, providerPaymentId, status, payload } = input;

  const isNewEvent = await insertWebhookEventOnce(provider, providerEventId, payload);
  if (!isNewEvent) {
    return { alreadyProcessed: true as const };
  }

  const payment = await prisma.payment.findUnique({
    where: { providerPaymentId },
  });
  if (!payment) {
    throw new Error(`Unknown providerPaymentId: ${providerPaymentId}`);
  }

  if (payment.status !== PaymentStatus.PENDING) {
    return { alreadyProcessed: true as const };
  }

  if (status === "FAILED") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });
    return { alreadyProcessed: false as const, succeeded: false as const };
  }

  const pkg = getPackage(payment.packageCode);
  if (!pkg) {
    throw new Error(`Unknown packageCode on payment ${payment.id}: ${payment.packageCode}`);
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.SUCCEEDED },
  });
  await grantPurchase(payment.userId, payment.id, pkg.minutes);
  await tryResumeGraceSession(payment.userId);

  return { alreadyProcessed: false as const, succeeded: true as const };
}

async function insertWebhookEventOnce(
  provider: string,
  providerEventId: string,
  payload: unknown
): Promise<boolean> {
  try {
    await prisma.paymentWebhookEvent.create({
      data: { provider, providerEventId, payload: payload as Prisma.InputJsonValue },
    });
    return true;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return false;
    }
    throw error;
  }
}
