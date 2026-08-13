"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import {
  listConversations,
  type ConvListItem,
  type ConvStatus,
} from "@/lib/api/chat.api";
import { PermissionGate } from "@/components/portal/PermissionGate";

type FilterType = "all" | ConvStatus;

const AVATAR_COLORS = [
  "bg-red-400 text-white",
  "bg-orange-400 text-white",
  "bg-amber-500 text-white",
  "bg-lime-500 text-white",
  "bg-emerald-500 text-white",
  "bg-teal-500 text-white",
  "bg-cyan-500 text-white",
  "bg-blue-500 text-white",
  "bg-violet-500 text-white",
  "bg-pink-500 text-white",
];

function avatarColor(id: string): string {
  const n = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function guestLabel(conv: ConvListItem): string {
  if (conv.guestName !== "Guest") return conv.guestName;
  const n = conv.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 999 + 1;
  return `Guest ${n}`;
}

export default function ChatInboxPage() {
  const locale = useLocale();
  const [filter, setFilter] = useState<FilterType>("all");
  const [conversations, setConversations] = useState<ConvListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = () =>
      listConversations({ limit: 100 })
        .then((res) => setConversations(res.items))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    load();
    const t = setInterval(load, 10_000);
    return () => clearInterval(t);
  }, []);

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

  const statusDot = (status: ConvStatus) => {
    if (status === "open") return "bg-green-500";
    if (status === "assigned") return "bg-blue-500";
    return "bg-muted-foreground";
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <PermissionGate
      needAny={["chat.read.all", "chat.read.assigned"]}
      fallback={
        <div className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          Bạn không có quyền truy cập trang này.
        </div>
      }
    >
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <h1 className="text-2xl font-bold text-foreground">Hộp thư Chat</h1>

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

      <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
        {filtered.map((conv) => (
          <Link
            key={conv.id}
            href={`/${locale}/portal/chat/${conv.id}`}
            className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex-shrink-0 relative">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm ${avatarColor(conv.id)}`}>
                {guestLabel(conv).charAt(0).toUpperCase()}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${statusDot(conv.status)}`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground truncate">
                  {guestLabel(conv)}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(conv.createdAt), {
                    addSuffix: true,
                    locale: locale === "vi" ? viLocale : undefined,
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {conv.lastMessage ?? "—"}
              </p>
            </div>

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
    </PermissionGate>
  );
}
