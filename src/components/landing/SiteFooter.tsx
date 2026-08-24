import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          Even Kletsen is bedoeld voor gezelschap, niet voor therapie of
          medisch advies. 18+.
        </p>
        <nav className="flex gap-5">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/voorwaarden" className="hover:text-foreground">
            Voorwaarden
          </Link>
        </nav>
      </div>
    </footer>
  );
}
