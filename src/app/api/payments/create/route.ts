import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/dal";
import { createPendingPayment } from "@/lib/payments/create-pending-payment";

const bodySchema = z.object({ packageCode: z.string() });

// JSON variant of the same flow as lib/actions/payments.ts's Server Action —
// used by client components (e.g. the "buy more time" panel inside an
// already-open chat) that need the redirect URL back to navigate themselves,
// rather than a full-page form submission.
export async function POST(request: Request) {
  const user = await requireUser();

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  try {
    const { paymentId, redirectUrl } = await createPendingPayment(user.id, parsed.data.packageCode);
    return NextResponse.json({ paymentId, redirectUrl });
  } catch {
    return NextResponse.json({ error: "Onbekend pakket" }, { status: 400 });
  }
}
