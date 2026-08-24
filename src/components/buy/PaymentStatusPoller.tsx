"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PaymentStatusPoller({ paymentId }: { paymentId: string }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/payments/${paymentId}/status`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status !== "PENDING") {
        router.refresh();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [paymentId, router]);

  return null;
}
