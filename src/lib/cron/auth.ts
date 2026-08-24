import "server-only";

/** Vercel Cron sends this header when CRON_SECRET is configured; rejects
 * anyone else from triggering these endpoints directly. */
export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}
