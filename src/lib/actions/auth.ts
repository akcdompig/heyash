"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth/auth";

export async function signInWithEmail(redirectTo: string, formData: FormData) {
  const email = formData.get("email");

  // redirect: false — signIn()'s default behavior throws a redirect to
  // /api/auth/verify-request, an API route, not a page. Thrown from inside a
  // Server Action, that redirect target gets handled by the client-side RSC
  // router instead of a full page navigation, and the router has no page to
  // render there, so it gets stuck. Redirecting to our own page explicitly
  // avoids the API route entirely.
  await signIn("resend", { email, redirectTo, redirect: false });
  redirect("/inloggen/check-je-mail");
}
