"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Plus, Pencil } from "lucide-react";
import { getAllUsers, updateUser, type StaffUser } from "@/fixtures/users";

export default function UsersPage() {
  const locale = useLocale();
  const [users, setUsers] = useState<StaffUser[]>(getAllUsers);

  function toggleStatus(id: string, current: "active" | "inactive") {
    updateUser(id, { status: current === "active" ? "inactive" : "active" });
    setUsers(getAllUsers());
  }

  const roleLabel = (role: string) => {
    if (role === "admin") return "Admin";
    if (role === "editor") return "Biên tập viên";
    return "Tác giả";
  };

  return (
    <div className="space-y-6">
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
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-medium text-foreground">
                      {user.name}
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
                      user.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {user.status === "active" ? "Hoạt động" : "Vô hiệu"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString("vi-VN")
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
                    <button
                      onClick={() => toggleStatus(user.id, user.status)}
                      className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
                    >
                      {user.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
