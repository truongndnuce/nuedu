"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/auth/useAuth";
import { FileText, MessageSquare, Clock, BookOpen } from "lucide-react";
import { getAllPostsAdmin } from "@/fixtures/posts";

export default function DashboardPage() {
  const { user } = useAuth();
  const locale = useLocale();
  const posts = getAllPostsAdmin();

  const stats = [
    {
      label: "Bài đã đăng",
      value: posts.filter((p) => p.status === "published").length,
      icon: FileText,
      color: "text-primary",
    },
    {
      label: "Đã lên lịch",
      value: posts.filter((p) => p.status === "scheduled").length,
      icon: Clock,
      color: "text-orange-500",
    },
    {
      label: "Bài nháp",
      value: posts.filter((p) => p.status === "draft").length,
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

  const recentPosts = posts.slice(0, 5);

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

      {/* Stat cards */}
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
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
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

      {/* Recent posts */}
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
              {recentPosts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/30 transition-colors">
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
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700"
                          : post.status === "scheduled"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {post.status === "published"
                        ? "Đã đăng"
                        : post.status === "scheduled"
                          ? "Đã lên lịch"
                          : "Nháp"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
