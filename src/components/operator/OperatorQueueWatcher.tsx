"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPusherClient } from "@/lib/realtime/pusher-client";
import { operatorChannelName } from "@/lib/realtime/channels";
import { EVENTS } from "@/lib/realtime/events";

/** Keeps the waiting-queue list live without a full client-side rewrite of
 * the dashboard — just refetches the Server Component when something
 * changes. */
export function OperatorQueueWatcher() {
  const router = useRouter();

  useEffect(() => {
    const client = getPusherClient();
    const channel = client.subscribe(operatorChannelName());
    channel.bind(EVENTS.SESSION_UPDATED, () => router.refresh());
    return () => {
      client.unsubscribe(operatorChannelName());
    };
  }, [router]);

  return null;
}
