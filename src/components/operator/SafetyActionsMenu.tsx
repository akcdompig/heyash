"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SAFETY_CATEGORIES, type SafetyCategoryCode } from "@/lib/safety/categories";

export function SafetyActionsMenu({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  const [open, setOpen] = useState<"report" | "block" | null>(null);
  const [category, setCategory] = useState<SafetyCategoryCode>(SAFETY_CATEGORIES[0].code);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submitReport() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/safety/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, category, description: reason || undefined }),
      });
      if (!res.ok) {
        setError("Melden is niet gelukt. Probeer het nog eens.");
        return;
      }
      setOpen(null);
      setReason("");
    } catch {
      setError("Melden is niet gelukt. Probeer het nog eens.");
    } finally {
      setBusy(false);
    }
  }

  async function submitBlock() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/safety/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, reason: reason || undefined }),
      });
      if (!res.ok) {
        setError("Blokkeren is niet gelukt. Probeer het nog eens.");
        return;
      }
      setOpen(null);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Blokkeren is niet gelukt. Probeer het nog eens.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => {
            setError(null);
            setOpen(open === "report" ? null : "report");
          }}
          className="rounded-full border border-border px-3 py-1.5 hover:bg-surface-tint"
        >
          Melden
        </button>
        <button
          onClick={() => {
            setError(null);
            setOpen(open === "block" ? null : "block");
          }}
          className="rounded-full border border-danger/40 px-3 py-1.5 text-danger hover:bg-danger/10"
        >
          Blokkeren
        </button>
      </div>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-xl border border-border bg-surface p-4 shadow-lift">
          {open === "report" && (
            <>
              <p className="text-xs font-semibold">Reden voor melding</p>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SafetyCategoryCode)}
                className="mt-2 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
              >
                {SAFETY_CATEGORIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </>
          )}
          {open === "block" && <p className="text-xs font-semibold">Reden voor blokkeren (optioneel)</p>}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
            placeholder="Toelichting…"
          />
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
          <button
            disabled={busy}
            onClick={open === "report" ? submitReport : submitBlock}
            className="mt-3 w-full rounded-full bg-danger px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Bezig…" : open === "report" ? "Melding versturen" : "Gebruiker blokkeren"}
          </button>
        </div>
      )}
    </div>
  );
}
