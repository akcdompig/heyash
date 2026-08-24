import type { Role, SessionStatus } from "@prisma/client";

// Typed event names/payloads shared between the server (pusher-server.ts,
// API routes) and the client (useChatSession, useTimer). Keeping them here
// avoids the payload shape drifting between the two sides.

export const EVENTS = {
  MESSAGE_NEW: "message:new",
  SESSION_UPDATED: "session:updated",
  SESSION_WARNING: "session:warning",
} as const;

export interface MessageNewPayload {
  id: string;
  senderRole: Role;
  body: string;
  createdAt: string;
}

export interface SessionUpdatedPayload {
  status: SessionStatus;
  endsAt: string | null;
  startedAt: string | null;
  endReason: string | null;
}

export interface SessionWarningPayload {
  minutesRemaining: 5 | 1;
}
