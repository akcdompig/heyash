import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";

// Neutral post-login landing spot: sends an operator straight to her
// dashboard and everyone else to the normal chat flow, regardless of which
// page they happened to click "Inloggen" from. Deep links that already know
// where they're going (e.g. proxy.ts redirecting a direct /dashboard visit
// to /inloggen?next=/dashboard) bypass this entirely.
export default async function AfterLoginRouter() {
  const user = await requireUser();

  if (user.role === "OPERATOR" || user.role === "ADMIN") {
    redirect("/dashboard");
  }
  redirect("/chat");
}
