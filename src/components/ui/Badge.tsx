import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "primary" | "secondary" | "warning" | "muted";
}

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  primary: "bg-primary/10 text-primary-hover",
  secondary: "bg-secondary/15 text-secondary-hover",
  warning: "bg-warning/20 text-warning-strong",
  muted: "bg-surface-tint text-muted",
};

export function Badge({ children, tone = "muted" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
