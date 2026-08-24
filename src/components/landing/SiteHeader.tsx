import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
      <Link href="/" className="font-display text-lg">
        Even Kletsen
      </Link>
      <nav className="flex items-center gap-4">
        <Link href="/inloggen" className="hidden text-sm text-muted hover:text-foreground sm:inline">
          Inloggen
        </Link>
        <LinkButton href="/chat" size="md">
          Even kletsen
        </LinkButton>
      </nav>
    </header>
  );
}
