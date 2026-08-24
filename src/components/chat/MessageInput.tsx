"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export function MessageInput({
  sending,
  onSend,
}: {
  sending: boolean;
  onSend: (body: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = value.trim();
    if (!body) return;
    setValue("");
    await onSend(body);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 border-t border-border p-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder="Typ een bericht…"
        rows={1}
        className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={sending || !value.trim()}
        className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        Sturen
      </button>
    </form>
  );
}
