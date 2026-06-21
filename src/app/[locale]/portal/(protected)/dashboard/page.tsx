"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/auth/useAuth";
import { FileText, MessageSquare, Clock, BookOpen } from "lucide-react";
import { listPosts, statusLabel, statusClass, type ApiPost } from "@/lib/api/posts.api";

export default function DashboardPage() {
  const { user } = useAuth();
  const locale = useLocale();

  const [recentPosts, setRecentPosts] = useState<ApiPost[]>([]);
  const [counts, setCounts] = useState({
    published: 0,
    scheduled: 0,
    draft: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listPosts({ limit: 5 }),
      listPosts({ limit: 1, status: "PUBLISHED" }),
      listPosts({ limit: 1, status: "SCHEDULED" }),
      listPosts({ limit: 1, status: "DRAFT" }),
    ])
      .then(([recent, pub, sched, draft]) => {
        setRecentPosts(recent.data);
        setCounts({
          published: pub.total,
          scheduled: sched.total,
          draft: draft.total,
        });
      })
      .catch(() => { /* stats optional */ })
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Bài đã đăng",
      value: counts.published,
      icon: FileText,
      color: "text-primary",
    },
    {
      label: "Đã lên lịch",
      value: counts.scheduled,
      icon: Clock,
      color: "text-orange-500",
    },
    {
      label: "Bài nháp",
      value: counts.draft,
      icon: BookOpen,
      color: "text-muted-foreground",
    },
    {
      label: "Cuộc chat mở",
      value: 0,
      icon: MessageSquare,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Xin chào, {user?.name} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Đây là tổng quan hoạt động của bạn
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">
              {loading ? (
                <span className="inline-block h-8 w-8 rounded bg-muted animate-pulse" />
              ) : (
                stat.value
              )}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">
          Thao tác nhanh
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/portal/posts/new`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            + Tạo bài viết
          </Link>
          <Link
            href={`/${locale}/portal/chat`}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Xem hộp thư chat
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">
          Bài viết gần đây
        </h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Tiêu đề
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Ngày
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  </td>
                </tr>
              ) : recentPosts.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Chưa có bài viết nào
                  </td>
                </tr>
              ) : (
                recentPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/${locale}/portal/posts/${post.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {post.titleVi}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(post.status)}`}
                      >
                        {statusLabel(post.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
                        : new Date(post.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
