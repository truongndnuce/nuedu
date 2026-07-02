"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  listPosts,
  deletePost,
  statusLabel,
  statusClass,
  type ApiPost,
  type PostStatus,
} from "@/lib/api/posts.api";
import { PermissionGate } from "@/components/portal/PermissionGate";

type FilterKey = "all" | PostStatus;

export default function PostsListPage() {
  const locale = useLocale();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listPosts({ limit: 100 })
      .then((res) => setPosts(res.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? posts : posts.filter((p) => p.status === filter);

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi xóa bài viết");
    }
  }

  const tabs: { key: FilterKey; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "PUBLISHED", label: "Đã đăng" },
    { key: "SCHEDULED", label: "Đã lên lịch" },
    { key: "DRAFT", label: "Nháp" },
  ];

  return (
    <PermissionGate
      needAny={[
        "posts.view",
        "posts.create",
        "posts.update.own",
        "posts.update.any",
        "posts.delete.own",
        "posts.delete.any",
        "posts.publish",
        "posts.schedule",
      ]}
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
          <button className="ml-2 underline" onClick={() => setError(null)}>
            Đóng
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Bài viết</h1>
        <PermissionGate need="posts.create">
          <Link
            href={`/${locale}/portal/posts/new`}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} />
            Tạo bài mới
          </Link>
        </PermissionGate>
      </div>

      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Tiêu đề
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Danh mục
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Ngày
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground line-clamp-1">
                      {post.titleVi}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {post.author.fullName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {post.category?.nameVi ?? "—"}
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <PermissionGate
                        needAny={["posts.update.own", "posts.update.any"]}
                      >
                        <Link
                          href={`/${locale}/portal/posts/${post.id}`}
                          className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                        >
                          <Pencil size={14} />
                        </Link>
                      </PermissionGate>
                      <PermissionGate need="posts.delete.own">
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </PermissionGate>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Không có bài viết nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </PermissionGate>
  );
}
