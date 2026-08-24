import type { ReactNode } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { signOut } from "@/lib/auth/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-lg">
          Even Kletsen
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted">
          <span>{user.creditBalance} min beschikbaar</span>
          <Link href="/account" className="hover:text-foreground">
            Account
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="hover:text-foreground">
              Uitloggen
            </button>
          </form>
        </nav>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
