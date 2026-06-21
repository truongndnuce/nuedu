import { cn } from "@/lib/utils";
import type { ChatMessage } from "./useGuestChat";

export function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.senderType === "system") {
    let label = msg.content;
    try {
      const parsed = JSON.parse(msg.content) as Record<string, string>;
      label = parsed["vi"] ?? parsed["en"] ?? msg.content;
    } catch { /* not JSON */ }
    return (
      <div className="flex items-center gap-2 py-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{label}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }

  const isStaff = msg.senderType === "staff";
  return (
    <div
      className={cn(
        "flex flex-col max-w-[85%]",
        isStaff ? "items-start" : "ml-auto items-end"
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
          isStaff
            ? "bg-muted text-foreground rounded-bl-sm"
            : "bg-primary text-primary-foreground rounded-br-sm"
        )}
      >
        {msg.content}
      </div>
    </div>
  );
}
