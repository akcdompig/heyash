import { redirect } from "next/navigation";
import { signMockWebhookBody, type MockWebhookBody } from "@/lib/payments/providers/mock";
import { formatPrice } from "@/lib/credits/packages";

export default async function MockCheckoutPage({
  params,
  searchParams,
}: PageProps<"/betalen/mock/[providerPaymentId]">) {
  const { providerPaymentId } = await params;
  const sp = await searchParams;
  const returnUrl = typeof sp.returnUrl === "string" ? sp.returnUrl : "/";
  const amount = typeof sp.amount === "string" ? Number(sp.amount) : 0;

  async function resolve(status: "SUCCEEDED" | "FAILED") {
    "use server";

    const body: MockWebhookBody = {
      providerPaymentId,
      eventId: crypto.randomUUID(),
      status,
    };
    const rawBody = JSON.stringify(body);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    await fetch(`${appUrl}/api/webhooks/mock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-mock-signature": signMockWebhookBody(rawBody),
      },
      body: rawBody,
    });

    redirect(`${returnUrl}&status=${status.toLowerCase()}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 text-center shadow-soft">
        <p className="text-xs uppercase tracking-wide text-muted mb-2">
          Testbetaling (mock)
        </p>
        <h1 className="font-display text-2xl mb-1">
          {formatPrice(amount)}
        </h1>
        <p className="text-sm text-muted mb-8">
          Dit is een neppe betaalpagina voor development. Er wordt geen echt
          geld verwerkt.
        </p>
        <div className="flex flex-col gap-3">
          <form action={resolve.bind(null, "SUCCEEDED")}>
            <button
              type="submit"
              className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              Simuleer geslaagde betaling
            </button>
          </form>
          <form action={resolve.bind(null, "FAILED")}>
            <button
              type="submit"
              className="w-full rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-surface-tint transition-colors"
            >
              Simuleer mislukte betaling
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
