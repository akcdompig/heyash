// Pure naming helpers, importable from both client and server code (unlike
// pusher-server.ts, which is server-only).

export function sessionChannelName(sessionId: string): string {
  return `private-session-${sessionId}`;
}

export function operatorChannelName(): string {
  return "private-operator-queue";
}
