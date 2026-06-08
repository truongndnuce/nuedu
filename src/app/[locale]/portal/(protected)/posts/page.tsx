"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Pencil, Trash2, Plus } from "lucide-react";
import { getAllPostsAdmin, deletePost, type Post } from "@/fixtures/posts";
import { PermissionGate } from "@/components/portal/PermissionGate";

type StatusFilter = "all" | "published" | "scheduled" | "draft";

export default function PostsListPage() {
  const locale = useLocale();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [posts, setPosts] = useState<Post[]>(getAllPostsAdmin);

  const filtered =
    filter === "all" ? posts : posts.filter((p) => p.status === filter);

  function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    deletePost(id);
    setPosts(getAllPostsAdmin());
  }

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "published", label: "Đã đăng" },
    { key: "scheduled", label: "Đã lên lịch" },
    { key: "draft", label: "Nháp" },
  ];

  const statusLabel = (status: string) => {
    if (status === "published") return "Đã đăng";
    if (status === "scheduled") return "Đã lên lịch";
    return "Nháp";
  };
  const statusClass = (status: string) => {
    if (status === "published") return "bg-green-100 text-green-700";
    if (status === "scheduled") return "bg-orange-100 text-orange-700";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
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

      {/* Status tabs */}
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

      {/* Table */}
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
                    {post.author.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {post.category.nameVi}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(post.status)}`}
                  >
                    {statusLabel(post.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
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
                    <PermissionGate need="posts.delete.any">
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
    </div>
  );
}
