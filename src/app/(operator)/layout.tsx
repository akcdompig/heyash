import type { ReactNode } from "react";
import Link from "next/link";
import { requireOperator } from "@/lib/auth/dal";
import { signOut } from "@/lib/auth/auth";

export default async function OperatorLayout({ children }: { children: ReactNode }) {
  await requireOperator();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link href="/dashboard" className="font-display text-lg">
          Even Kletsen — Ashley
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="text-sm text-muted hover:text-foreground">
            Uitloggen
          </button>
        </form>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
