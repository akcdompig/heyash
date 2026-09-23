import "dotenv/config";
import { registerTikkieWebhook } from "@/lib/payments/providers/tikkie";

// One-off setup, not part of the app's request path: tells Tikkie where to
// POST payment notifications. Run once per environment after TIKKIE_API_KEY
// / TIKKIE_APP_TOKEN are set:
//   npm run tikkie:register-webhook
// Re-running replaces the previously registered URL (Tikkie allows only one
// active subscription per app).
async function main() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL must be set (the real public domain, not localhost)");
  }

  const notificationUrl = `${appUrl}/api/webhooks/tikkie`;
  const { subscriptionId } = await registerTikkieWebhook(notificationUrl);
  console.log(`Registered Tikkie webhook subscription ${subscriptionId} -> ${notificationUrl}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
