"use client";

import { useRef, useEffect, useState } from "react";
import { Send, X } from "lucide-react";
import { useGuestChat } from "./useGuestChat";
import { MessageBubble } from "./MessageBubble";
import { TypingDots } from "@/components/chat/TypingDots";

interface ChatPanelProps {
  onClose: () => void;
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const { messages, sendMessage, notifyTyping, isTyping, sendError, sending } = useGuestChat();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim() || sending) return;
    sendMessage(input.trim());
    setInput("");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between bg-primary px-4 py-3 rounded-t-xl">
        <div>
          <p className="text-sm font-semibold text-primary-foreground">NUEDU Support</p>
          <p className="text-xs text-primary-foreground/70">Thường trả lời trong vài phút</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-background">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isTyping && (
          <div className="flex items-start">
            <TypingDots />
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Send error */}
      {sendError && (
        <div className="px-4 py-1.5 text-xs text-destructive bg-destructive/10">
          {sendError}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border px-3 py-3 bg-background rounded-b-xl">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); notifyTyping(); }}
            onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
            placeholder="Nhập tin nhắn..."
            disabled={sending}
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
