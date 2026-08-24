import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

// Data Access Layer: the real (non-optimistic) auth checks. `proxy.ts` only
// does a cheap cookie-presence redirect — every page, Server Action, and
// Route Handler that needs a user calls into these instead of trusting a
// parent layout, since layouts don't re-run on client-side navigation.

export const getSession = cache(async () => {
  return auth();
});

export const requireUser = cache(async () => {
  const session = await getSession();
  if (!session?.user) {
    redirect("/inloggen");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      creditBalance: true,
      hasUsedFreeIntro: true,
      ageConfirmedAt: true,
      deletedAt: true,
    },
  });

  if (!user || user.deletedAt) {
    redirect("/inloggen");
  }

  return user;
});

export const requireAgeConfirmed = cache(async () => {
  const user = await requireUser();
  if (!user.ageConfirmedAt) {
    redirect("/leeftijd-bevestigen");
  }
  return user;
});

export const requireOperator = cache(async () => {
  const user = await requireUser();
  if (user.role !== "OPERATOR" && user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
});
