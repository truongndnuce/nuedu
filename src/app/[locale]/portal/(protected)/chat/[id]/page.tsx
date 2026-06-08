"use client";

import { useState, use, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { notFound } from "next/navigation";
import { ArrowLeft, Send, UserCheck, X } from "lucide-react";
import {
  getConversationById,
  sendMessage,
  closeConversation,
  assignConversation,
  type Message,
  type Conversation,
} from "@/fixtures/conversations";
import { useAuth } from "@/lib/auth/useAuth";
import { format } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();

  const initialConv = getConversationById(id);
  if (!initialConv) notFound();

  const [conv, setConv] = useState<Conversation>(initialConv);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv.messages]);

  function handleSend() {
    if (!input.trim() || !user) return;
    const msg = sendMessage(id, input.trim(), user.name);
    if (msg) {
      setConv({ ...getConversationById(id)! });
    }
    setInput("");
  }

  function handleAssign() {
    if (!user) return;
    assignConversation(id, user.name);
    setConv({ ...getConversationById(id)! });
  }

  function handleClose() {
    if (!confirm("Đóng cuộc trò chuyện này?")) return;
    closeConversation(id);
    setConv({ ...getConversationById(id)! });
  }

  const dateLocale = locale === "vi" ? viLocale : undefined;

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4 bg-background">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold text-foreground">{conv.guestName}</h2>
          {conv.guestPhone && (
            <p className="text-xs text-muted-foreground">{conv.guestPhone}</p>
          )}
        </div>
        {/* Status badge */}
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            conv.status === "open" && "bg-green-100 text-green-700",
            conv.status === "assigned" && "bg-blue-100 text-blue-700",
            conv.status === "closed" && "bg-muted text-muted-foreground"
          )}
        >
          {conv.status === "open"
            ? "Đang mở"
            : conv.status === "assigned"
              ? "Đã giao"
              : "Đã đóng"}
        </span>
        {/* Actions */}
        {conv.status !== "closed" && (
          <>
            {conv.status === "open" && (
              <button
                onClick={handleAssign}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                <UserCheck size={14} />
                Giao cho tôi
              </button>
            )}
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 rounded-lg bg-destructive/10 text-destructive px-3 py-1.5 text-sm hover:bg-destructive/20 transition-colors"
            >
              <X size={14} />
              Đóng
            </button>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {conv.messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[70%]",
              msg.senderType === "staff" ? "ml-auto items-end" : "items-start"
            )}
          >
            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 text-sm",
                msg.senderType === "staff"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              )}
            >
              {msg.content}
            </div>
            <span className="mt-1 text-[10px] text-muted-foreground px-1">
              {msg.senderName} ·{" "}
              {format(new Date(msg.createdAt), "HH:mm", { locale: dateLocale })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {conv.status !== "closed" ? (
        <div className="border-t border-border px-6 py-4 bg-background">
          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="rounded-xl bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-border px-6 py-4 bg-muted/30 text-center text-sm text-muted-foreground">
          Cuộc trò chuyện đã đóng
        </div>
      )}
    </div>
  );
}
