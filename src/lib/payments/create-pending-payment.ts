import "server-only";
import { prisma } from "@/lib/db/prisma";
import { getPackage } from "@/lib/credits/packages";
import { getPaymentProvider } from "@/lib/payments";

export async function createPendingPayment(userId: string, packageCode: string) {
  const pkg = getPackage(packageCode);
  if (!pkg) {
    throw new Error(`Unknown packageCode: ${packageCode}`);
  }
  const paymentProvider = getPaymentProvider();

  const payment = await prisma.payment.create({
    data: {
      userId,
      packageCode: pkg.code,
      amountCents: pkg.priceCents,
      provider: paymentProvider.id,
      providerPaymentId: `pending_${crypto.randomUUID()}`,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const returnUrl = `${appUrl}/buy/bedankt?payment=${payment.id}`;

  const { providerPaymentId, redirectUrl } = await paymentProvider.createPayment({
    localPaymentId: payment.id,
    packageCode: pkg.code,
    amountCents: pkg.priceCents,
    returnUrl,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { providerPaymentId },
  });

  return { paymentId: payment.id, redirectUrl };
}
