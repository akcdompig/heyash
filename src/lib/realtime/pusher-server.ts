import "server-only";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID ?? "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
  secret: process.env.PUSHER_SECRET ?? "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu",
  useTLS: true,
  // Bounds worst-case latency on every request that publishes an event
  // (send message, accept/end/block a session, ...). Without this, a slow
  // or unreachable Pusher endpoint — including an unconfigured dev
  // environment — can otherwise hang for many seconds before the safeTrigger
  // catch below even gets a chance to degrade gracefully.
  timeout: 5000,
});

// Pusher is a delivery mechanism for instant UI updates, not the source of
// truth — every event it carries reflects a change already committed to
// Postgres. A Pusher outage or missing credentials should degrade to
// "the client resyncs on its next heartbeat/poll instead of instantly," not
// break the underlying request (sending a message, accepting a session).
export const pusherServer = {
  async trigger(channel: string, event: string, data: unknown) {
    try {
      await pusher.trigger(channel, event, data);
    } catch (error) {
      console.error(`Pusher trigger failed (${channel}/${event}):`, error);
    }
  },
  authorizeChannel: pusher.authorizeChannel.bind(pusher),
};

export { sessionChannelName, operatorChannelName } from "@/lib/realtime/channels";
