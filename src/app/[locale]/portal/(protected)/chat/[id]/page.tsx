"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft, Send, UserCheck, X } from "lucide-react";
import {
  getConversation,
  getMessages,
  sendMessage,
  assignToSelf,
  closeConversation,
  markRead,
  type ConvDetail,
  type ConvMessage,
} from "@/lib/api/chat.api";
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

  const [conv, setConv] = useState<ConvDetail | null>(null);
  const [messages, setMessages] = useState<ConvMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([getConversation(id), getMessages(id)])
      .then(([c, msgs]) => {
        setConv(c);
        setMessages(msgs);
        markRead(id).catch(() => { /* ignore */ });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Poll for new messages every 5 s (starts after initial load)
  useEffect(() => {
    if (loading) return;
    const t = setInterval(() => {
      getMessages(id).then((msgs) =>
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const fresh = msgs.filter((m) => !ids.has(m.id));
          return fresh.length ? [...prev, ...fresh] : prev;
        })
      ).catch(() => { /* ignore polling errors */ });
    }, 5_000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !user || !conv) return;
    const content = input.trim();
    setSending(true);
    setInput("");
    try {
      await sendMessage(id, content);
      const newMsg: ConvMessage = {
        id: `tmp-${Date.now()}`,
        senderType: "staff",
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi gửi tin nhắn");
      setInput(content);
    } finally {
      setSending(false);
    }
  }

  async function handleAssign() {
    if (!conv) return;
    try {
      await assignToSelf(id);
      setConv({ ...conv, status: "assigned" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi giao chat");
    }
  }

  async function handleClose() {
    if (!confirm("Đóng cuộc trò chuyện này?") || !conv) return;
    try {
      await closeConversation(id);
      setConv({ ...conv, status: "closed" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi đóng chat");
    }
  }

  const dateLocale = locale === "vi" ? viLocale : undefined;

  const AVATAR_COLORS = [
    "bg-red-400",
    "bg-orange-400",
    "bg-amber-500",
    "bg-lime-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-blue-500",
    "bg-violet-500",
    "bg-pink-500",
  ];

  function avatarColor(convId: string): string {
    const n = convId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return AVATAR_COLORS[n % AVATAR_COLORS.length];
  }

  const guestDisplayName =
    conv?.guestName === "Guest"
      ? `Guest ${(id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 999) + 1}`
      : (conv?.guestName ?? "Guest");

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!conv) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Không tìm thấy cuộc trò chuyện
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full -m-6">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4 bg-background">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${avatarColor(id)}`}>
          {guestDisplayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-foreground">{guestDisplayName}</h2>
          {conv.guestPhone && (
            <p className="text-xs text-muted-foreground">{conv.guestPhone}</p>
          )}
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            conv.status === "open" && "bg-green-100 text-green-700",
            conv.status === "assigned" && "bg-blue-100 text-blue-700",
            conv.status === "closed" && "bg-muted text-muted-foreground",
          )}
        >
          {conv.status === "open"
            ? "Đang mở"
            : conv.status === "assigned"
              ? "Đã giao"
              : "Đã đóng"}
        </span>
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

      {error && (
        <div className="px-6 py-2 bg-destructive/10 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[70%]",
              msg.senderType === "staff" ? "ml-auto items-end" : "items-start",
            )}
          >
            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 text-sm",
                msg.senderType === "staff"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm",
              )}
            >
              {msg.content}
            </div>
            <span className="mt-1 text-[10px] text-muted-foreground px-1">
              {msg.senderType === "staff" ? "Nhân viên" : conv.guestName} ·{" "}
              {format(new Date(msg.createdAt), "HH:mm", {
                locale: dateLocale,
              })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {conv.status !== "closed" ? (
        <div className="border-t border-border px-6 py-4 bg-background">
          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend()
              }
              placeholder="Nhập tin nhắn..."
              disabled={sending}
              className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
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
