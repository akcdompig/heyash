"use client";

import { useEffect, useRef } from "react";
import { useChatSession, type ChatMessage } from "@/hooks/useChatSession";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { TimerBadge } from "@/components/chat/TimerBadge";
import { TimeWarningBanner } from "@/components/chat/TimeWarningBanner";
import { WaitingRoom } from "@/components/chat/WaitingRoom";
import { EndOfTimeCard } from "@/components/chat/EndOfTimeCard";
import { AshleyAvatar } from "@/components/landing/AshleyAvatar";
import type { SessionStatus } from "@prisma/client";

interface ChatRoomProps {
  sessionId: string;
  initialMessages: ChatMessage[];
  initialStatus: SessionStatus;
  initialEndsAt: string | null;
  initialStartedAt: string | null;
  initialEndReason: string | null;
  isFreeIntro: boolean;
  viewerRole: "USER" | "OPERATOR";
  headerTitle: string;
  headerSubtitle?: string;
  extraActions?: React.ReactNode;
}

export function ChatRoom({
  sessionId,
  initialMessages,
  initialStatus,
  initialEndsAt,
  initialStartedAt,
  initialEndReason,
  isFreeIntro,
  viewerRole,
  headerTitle,
  headerSubtitle,
  extraActions,
}: ChatRoomProps) {
  const {
    messages,
    status,
    endsAt,
    endReason,
    warning,
    sending,
    sendMessage,
    endSession,
    dismissWarning,
  } = useChatSession({
    sessionId,
    initialMessages,
    initialStatus,
    initialEndsAt,
    initialStartedAt,
    initialEndReason,
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          {viewerRole === "USER" && <AshleyAvatar size={36} />}
          <div>
            <p className="font-semibold">{headerTitle}</p>
            {headerSubtitle && <p className="text-xs text-muted">{headerSubtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {status === "ACTIVE" && <TimerBadge endsAt={endsAt} />}
          {extraActions}
          {(status === "ACTIVE" || status === "WAITING") && (
            <button
              onClick={endSession}
              className="text-xs text-muted underline underline-offset-2 hover:text-foreground"
            >
              Gesprek beëindigen
            </button>
          )}
        </div>
      </div>

      {warning && <TimeWarningBanner minutesRemaining={warning} onDismiss={dismissWarning} />}

      {status === "WAITING" && <WaitingRoom />}

      {status === "GRACE" && <EndOfTimeCard isFreeIntro={isFreeIntro} viewerRole={viewerRole} />}

      {status === "ENDED" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
          {endReason === "operator_declined" ? (
            <>
              <h2 className="font-display text-2xl">Ashley kon nu niet</h2>
              <p className="text-sm text-muted">Probeer het straks nog eens 💛</p>
            </>
          ) : (
            <>
              <h2 className="font-display text-2xl">Gesprek beëindigd</h2>
              <p className="text-sm text-muted">Bedankt voor het kletsen 💛</p>
            </>
          )}
        </div>
      )}

      {status === "ACTIVE" && (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} viewerRole={viewerRole} />
            ))}
            <div ref={bottomRef} />
          </div>
          <MessageInput sending={sending} onSend={sendMessage} />
        </>
      )}
    </div>
  );
}
