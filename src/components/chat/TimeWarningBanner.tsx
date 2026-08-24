"use client";

export function TimeWarningBanner({
  minutesRemaining,
  onDismiss,
}: {
  minutesRemaining: 5 | 1;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 bg-warning/15 px-4 py-2.5 text-sm text-warning-strong">
      <span>
        {minutesRemaining === 5
          ? "Nog zo'n 5 minuten gesprekstijd over."
          : "Nog maar 1 minuutje — bijna op."}
      </span>
      <button onClick={onDismiss} className="text-xs underline underline-offset-2">
        Oké
      </button>
    </div>
  );
}
