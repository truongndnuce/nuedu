"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Plus, Pencil } from "lucide-react";
import {
  listUsers,
  deactivateUser,
  roleLabel,
  type ApiUser,
} from "@/lib/api/users.api";

export default function UsersPage() {
  const locale = useLocale();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listUsers({ limit: 100 })
      .then((res) => setUsers(res.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDeactivate(id: string) {
    if (!confirm("Vô hiệu hóa tài khoản này?")) return;
    try {
      await deactivateUser(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: false } : u)),
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi vô hiệu hóa");
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
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
        <h1 className="text-2xl font-bold text-foreground">Người dùng</h1>
        <Link
          href={`/${locale}/portal/users/new`}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          Thêm nhân viên
        </Link>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Tên
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Vai trò
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Đăng nhập cuối
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                      {user.fullName.charAt(0)}
                    </div>
                    <span className="font-medium text-foreground">
                      {user.fullName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {roleLabel(user.role)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {user.isActive ? "Hoạt động" : "Vô hiệu"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString("vi-VN")
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <Link
                      href={`/${locale}/portal/users/${user.id}`}
                      className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                    >
                      <Pencil size={14} />
                    </Link>
                    {user.isActive && (
                      <button
                        onClick={() => handleDeactivate(user.id)}
                        className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
                      >
                        Vô hiệu hóa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Chưa có người dùng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
