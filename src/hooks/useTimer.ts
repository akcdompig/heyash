"use client";

import { useEffect, useState } from "react";

/** Purely cosmetic countdown — always derived from the server-provided
 * `endsAt`, never decided locally. Resyncs automatically whenever `endsAt`
 * changes (heartbeat responses, Pusher session:updated events). */
export function useTimer(endsAt: string | null): number | null {
  const [prevEndsAt, setPrevEndsAt] = useState(endsAt);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(() =>
    computeRemaining(endsAt)
  );

  // Adjusting state during render (not in an effect) when a prop changes —
  // see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (endsAt !== prevEndsAt) {
    setPrevEndsAt(endsAt);
    setRemainingSeconds(computeRemaining(endsAt));
  }

  useEffect(() => {
    if (!endsAt) return;
    const interval = setInterval(() => {
      setRemainingSeconds(computeRemaining(endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return remainingSeconds;
}

function computeRemaining(endsAt: string | null): number | null {
  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - Date.now();
  return Math.max(0, Math.round(ms / 1000));
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
