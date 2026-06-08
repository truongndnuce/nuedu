import { cn } from "@/lib/utils";
import type { ChatMessage } from "./useGuestChat";

export function MessageBubble({ msg }: { msg: ChatMessage }) {
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
