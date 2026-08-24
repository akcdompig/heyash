import "server-only";
import { Prisma, TxType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

interface WriteLedgerEntryInput {
  userId: string;
  type: TxType;
  amountMinutes: number; // signed: positive credits, negative debits
  idempotencyKey: string;
  paymentId?: string;
  sessionId?: string;
}

export class InsufficientCreditsError extends Error {
  constructor() {
    super("Insufficient credit balance");
    this.name = "InsufficientCreditsError";
  }
}

/**
 * Writes one ledger entry and updates the denormalized balance atomically,
 * serialized per-user via a Postgres advisory lock so concurrent requests
 * (a double-submitted purchase, a heartbeat racing a message-send billing
 * tick) can't race each other. `CreditTransaction.idempotencyKey` is unique,
 * so a retried call with the same key is a safe no-op rather than a double
 * write — and `User.creditBalance` has a CHECK (>= 0) constraint as the
 * final backstop against ever going negative.
 */
export async function writeLedgerEntry(input: WriteLedgerEntryInput) {
  const { userId, type, amountMinutes, idempotencyKey, paymentId, sessionId } = input;

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

      if (amountMinutes < 0) {
        const user = await tx.user.findUniqueOrThrow({
          where: { id: userId },
          select: { creditBalance: true },
        });
        if (user.creditBalance + amountMinutes < 0) {
          throw new InsufficientCreditsError();
        }
      }

      const [, updatedUser] = await Promise.all([
        tx.creditTransaction.create({
          data: {
            userId,
            type,
            amountMinutes,
            idempotencyKey,
            paymentId,
            sessionId,
          },
        }),
        tx.user.update({
          where: { id: userId },
          data: {
            creditBalance: { increment: amountMinutes },
            ...(type === TxType.FREE_INTRO ? { hasUsedFreeIntro: true } : {}),
          },
          select: { creditBalance: true },
        }),
      ]);

      return { balance: updatedUser.creditBalance, applied: true as const };
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // Already applied under this idempotency key — treat as a success.
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { creditBalance: true },
      });
      return { balance: user.creditBalance, applied: false as const };
    }
    throw error;
  }
}

export function grantFreeIntro(userId: string) {
  return writeLedgerEntry({
    userId,
    type: TxType.FREE_INTRO,
    amountMinutes: 2,
    idempotencyKey: `free-intro-${userId}`,
  });
}

export function grantPurchase(userId: string, paymentId: string, minutes: number) {
  return writeLedgerEntry({
    userId,
    type: TxType.PURCHASE,
    amountMinutes: minutes,
    idempotencyKey: `payment-credit-${paymentId}`,
    paymentId,
  });
}

export function debitUsage(
  userId: string,
  sessionId: string,
  minutes: number,
  minutesDebitedSoFar: number
) {
  return writeLedgerEntry({
    userId,
    type: TxType.USAGE,
    amountMinutes: -minutes,
    idempotencyKey: `usage-${sessionId}-${minutesDebitedSoFar}-${minutesDebitedSoFar + minutes}`,
    sessionId,
  });
}
