"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { listRoles, deleteRole, type ApiCustomRole } from "@/lib/api/roles.api";
import { roleLabel } from "@/lib/api/users.api";
import { useAuth } from "@/lib/auth/useAuth";

const SYSTEM_ROLES = ["ADMIN", "STAFF"] as const;

export default function RolesPage() {
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();
  const [roles, setRoles] = useState<ApiCustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    listRoles()
      .then(setRoles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(role: ApiCustomRole) {
    if (!confirm(`Xóa vai trò "${role.name}"? Không thể xóa nếu đang có nhân viên sử dụng.`)) return;
    setDeleting(role.id);
    try {
      await deleteRole(role.id);
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi xóa vai trò");
    } finally {
      setDeleting(null);
    }
  }

  if (user && user.role !== "admin") {
    return (
      <div className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
        Bạn không có quyền truy cập trang này.
      </div>
    );
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
          <button className="ml-2 underline" onClick={() => setError(null)}>Đóng</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vai trò</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tạo và quản lý các vai trò tùy chỉnh với bộ quyền riêng
          </p>
        </div>
        <button
          onClick={() => router.push(`/${locale}/portal/roles/new`)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Tạo vai trò mới
        </button>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-2">Vai trò hệ thống</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {SYSTEM_ROLES.map((role) => (
                <tr key={role} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{roleLabel(role)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Vai trò cố định của hệ thống, không thể xóa hoặc đổi tên
                  </td>
                  <td className="px-4 py-3 w-10">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => router.push(`/${locale}/portal/roles/system/${role}`)}
                        className="rounded p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Sửa quyền"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-foreground">Vai trò tùy chỉnh</h2>

      {roles.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm">Chưa có vai trò nào. Tạo vai trò đầu tiên để phân quyền linh hoạt hơn.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Tên vai trò</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Mô tả</th>
                <th className="text-center px-4 py-3 font-semibold text-foreground">Quyền</th>
                <th className="text-center px-4 py-3 font-semibold text-foreground">Thành viên</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{role.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{role.description ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                      {role.permissionCount ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{role.userCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/${locale}/portal/roles/${role.id}`)}
                        className="rounded p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(role)}
                        disabled={deleting === role.id}
                        className="rounded p-1.5 hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive disabled:opacity-50"
                        title="Xóa"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
