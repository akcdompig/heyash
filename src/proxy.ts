import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic-only check: presence of the Auth.js session cookie, nothing
// more. It exists purely to bounce obviously-signed-out visitors before they
// hit a protected page. It must NOT decrypt/verify the session or touch the
// database here (that would need the Node Postgres driver adapter, which
// doesn't belong in Proxy) — the real, verified check lives in
// `lib/auth/dal.ts` and runs again on every protected page/action/route.
const PROTECTED_PREFIXES = ["/account", "/chat", "/buy", "/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  const hasSessionCookie =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token");

  if (!hasSessionCookie) {
    const loginUrl = new URL("/inloggen", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
