import type { ChatMessage } from "@/hooks/useChatSession";

export function MessageBubble({
  message,
  viewerRole,
}: {
  message: ChatMessage;
  viewerRole: "USER" | "OPERATOR";
}) {
  const isOwn = message.senderRole === viewerRole;
  const label = isOwn ? "Jij" : viewerRole === "USER" ? "Ashley" : "Gast";

  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
      <span className="mb-1 px-1 text-[11px] font-medium text-muted">{label}</span>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-surface-tint text-foreground rounded-bl-sm"
        }`}
      >
        {message.body}
      </div>
    </div>
  );
}
