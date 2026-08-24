"use client";

import { useTimer, formatDuration } from "@/hooks/useTimer";

export function TimerBadge({ endsAt }: { endsAt: string | null }) {
  const remaining = useTimer(endsAt);
  if (remaining === null) return null;

  const isLow = remaining <= 60;

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold tabular-nums ${
        isLow ? "bg-warning/20 text-warning-strong" : "bg-surface-tint text-muted"
      }`}
    >
      {formatDuration(remaining)} resterend
    </span>
  );
}
