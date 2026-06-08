"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import { getAllConversations, type Conversation } from "@/fixtures/conversations";

type FilterType = "open" | "assigned" | "closed" | "all";

export default function ChatInboxPage() {
  const locale = useLocale();
  const [filter, setFilter] = useState<FilterType>("all");
  const [conversations] = useState<Conversation[]>(getAllConversations);

  const filtered =
    filter === "all"
      ? conversations
      : conversations.filter((c) => c.status === filter);

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "Tất cả", count: conversations.length },
    {
      key: "open",
      label: "Đang mở",
      count: conversations.filter((c) => c.status === "open").length,
    },
    {
      key: "assigned",
      label: "Giao cho tôi",
      count: conversations.filter((c) => c.status === "assigned").length,
    },
    {
      key: "closed",
      label: "Đã đóng",
      count: conversations.filter((c) => c.status === "closed").length,
    },
  ];

  const statusColor = (status: string) => {
    if (status === "open") return "bg-green-500";
    if (status === "assigned") return "bg-blue-500";
    return "bg-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Hộp thư Chat</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.label}
            <span className="rounded-full bg-white/20 px-1.5 text-xs">
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Conversation list */}
      <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
        {filtered.map((conv) => (
          <Link
            key={conv.id}
            href={`/${locale}/portal/chat/${conv.id}`}
            className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
          >
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                {conv.guestName.charAt(0)}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${statusColor(conv.status)}`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground truncate">
                  {conv.guestName}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(conv.createdAt), {
                    addSuffix: true,
                    locale: locale === "vi" ? viLocale : undefined,
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {conv.lastMessage}
              </p>
            </div>

            {/* Unread badge */}
            {conv.unread > 0 && (
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary text-xs font-bold text-primary-foreground flex items-center justify-center">
                {conv.unread}
              </span>
            )}
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            Không có cuộc trò chuyện nào
          </div>
        )}
      </div>
    </div>
  );
}
