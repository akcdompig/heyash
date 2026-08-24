"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SessionStatus } from "@prisma/client";
import { getPusherClient } from "@/lib/realtime/pusher-client";
import { sessionChannelName } from "@/lib/realtime/channels";
import {
  EVENTS,
  type MessageNewPayload,
  type SessionUpdatedPayload,
  type SessionWarningPayload,
} from "@/lib/realtime/events";
import { HEARTBEAT_INTERVAL_MS } from "@/lib/sessions/constants";

export interface ChatMessage {
  id: string;
  senderRole: string;
  body: string;
  createdAt: string;
}

interface UseChatSessionInput {
  sessionId: string;
  initialMessages: ChatMessage[];
  initialStatus: SessionStatus;
  initialEndsAt: string | null;
  initialStartedAt: string | null;
  initialEndReason: string | null;
}

export function useChatSession({
  sessionId,
  initialMessages,
  initialStatus,
  initialEndsAt,
  initialStartedAt,
  initialEndReason,
}: UseChatSessionInput) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState<SessionStatus>(initialStatus);
  const [endsAt, setEndsAt] = useState<string | null>(initialEndsAt);
  const [startedAt, setStartedAt] = useState<string | null>(initialStartedAt);
  const [endReason, setEndReason] = useState<string | null>(initialEndReason);
  const [warning, setWarning] = useState<5 | 1 | null>(null);
  const [sending, setSending] = useState(false);
  const dismissedWarningRef = useRef<5 | 1 | null>(null);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
  }, []);

  useEffect(() => {
    const client = getPusherClient();
    const channel = client.subscribe(sessionChannelName(sessionId));

    channel.bind(EVENTS.MESSAGE_NEW, (payload: MessageNewPayload) => {
      addMessage(payload);
    });
    channel.bind(EVENTS.SESSION_UPDATED, (payload: SessionUpdatedPayload) => {
      setStatus(payload.status);
      setEndsAt(payload.endsAt);
      setStartedAt(payload.startedAt);
      setEndReason(payload.endReason);
    });
    channel.bind(EVENTS.SESSION_WARNING, (payload: SessionWarningPayload) => {
      if (dismissedWarningRef.current !== payload.minutesRemaining) {
        setWarning(payload.minutesRemaining);
      }
    });

    return () => {
      client.unsubscribe(sessionChannelName(sessionId));
    };
  }, [sessionId, addMessage]);

  useEffect(() => {
    if (status !== "ACTIVE") return;

    const tick = async () => {
      const res = await fetch("/api/session/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data.status);
      setEndsAt(data.endsAt);
      setStartedAt(data.startedAt);
    };

    tick();
    const interval = setInterval(tick, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [sessionId, status]);

  const sendMessage = useCallback(
    async (body: string) => {
      setSending(true);
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, body }),
        });
        // Appended directly from the server's response rather than waiting
        // for the Pusher echo — the sender should see their own message
        // immediately, not depend on realtime delivery round-tripping back.
        if (res.ok) {
          addMessage(await res.json());
        }
        return res.ok;
      } finally {
        setSending(false);
      }
    },
    [sessionId, addMessage]
  );

  const endSession = useCallback(async () => {
    await fetch(`/api/session/${sessionId}/end`, { method: "POST" });
  }, [sessionId]);

  const dismissWarning = useCallback(() => {
    dismissedWarningRef.current = warning;
    setWarning(null);
  }, [warning]);

  return {
    messages,
    status,
    endsAt,
    startedAt,
    endReason,
    warning,
    sending,
    sendMessage,
    endSession,
    dismissWarning,
  };
}
