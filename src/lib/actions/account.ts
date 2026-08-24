"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db/prisma";

export async function confirmAgeAction() {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { ageConfirmedAt: new Date() },
  });
  redirect("/chat");
}

export async function deleteAccountAction() {
  const user = await requireUser();

  // Soft delete: financial records (Payment, CreditTransaction) are kept for
  // bookkeeping purposes, unlinked from any further use of the account.
  // Full anonymization/hard-deletion timing is a follow-up that needs legal
  // input on the exact retention period — see the architecture notes.
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { deletedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);

  redirect("/");
}
