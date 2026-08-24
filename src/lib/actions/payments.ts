"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { createPendingPayment } from "@/lib/payments/create-pending-payment";

export async function createPaymentAction(packageCode: string) {
  const user = await requireUser();
  const { redirectUrl } = await createPendingPayment(user.id, packageCode);
  redirect(redirectUrl);
}
