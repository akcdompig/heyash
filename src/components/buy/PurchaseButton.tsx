"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function PurchaseButton({
  packageCode,
  popular,
}: {
  packageCode: string;
  popular?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageCode }),
    });
    if (!res.ok) {
      setPending(false);
      return;
    }
    const { paymentId, redirectUrl, opensInNewTab } = await res.json();

    // Providers whose hosted payment page never redirects back to us (e.g.
    // Tikkie) get opened in a separate tab, so this tab can stay on the
    // polling "bedankt" page instead of getting stranded on a dead end.
    if (opensInNewTab) {
      window.open(redirectUrl, "_blank", "noopener,noreferrer");
      router.push(`/buy/bedankt?payment=${paymentId}`);
    } else {
      window.location.href = redirectUrl;
    }
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={pending}
      variant={popular ? "primary" : "secondary"}
      className="w-full"
    >
      {pending ? "Bezig…" : "Kiezen"}
    </Button>
  );
}
