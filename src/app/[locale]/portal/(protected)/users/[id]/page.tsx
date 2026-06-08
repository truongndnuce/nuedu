"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getUserById,
  updateUser,
  ALL_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
  type StaffUser,
  type UserRole,
} from "@/fixtures/users";

// Group permissions by category
function groupedPermissions() {
  const groups: Record<string, typeof ALL_PERMISSIONS> = {};
  for (const p of ALL_PERMISSIONS) {
    groups[p.group] = groups[p.group] ?? [];
    groups[p.group].push(p);
  }
  return groups;
}

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const locale = useLocale();

  const initial = getUserById(id);
  if (!initial) notFound();

  const [user, setUser] = useState<StaffUser>(initial);
  const [activeTab, setActiveTab] = useState<"profile" | "permissions">("profile");
  const groups = groupedPermissions();

  function togglePermission(key: string) {
    const perms = user.permissions.includes(key)
      ? user.permissions.filter((p) => p !== key)
      : [...user.permissions, key];
    setUser({ ...user, permissions: perms });
  }

  function resetToRoleDefaults() {
    setUser({ ...user, permissions: ROLE_DEFAULT_PERMISSIONS[user.role] });
  }

  function handleSave() {
    updateUser(id, { name: user.name, email: user.email, role: user.role, permissions: user.permissions });
    router.push(`/${locale}/portal/users`);
  }

  const roleDefault = ROLE_DEFAULT_PERMISSIONS[user.role] ?? [];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Chỉnh sửa người dùng</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["profile", "permissions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {tab === "profile" ? "Hồ sơ" : "Phân quyền"}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tên</label>
            <input
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              type="email"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Vai trò</label>
            <select
              value={user.role}
              onChange={(e) =>
                setUser({
                  ...user,
                  role: e.target.value as UserRole,
                  permissions: ROLE_DEFAULT_PERMISSIONS[e.target.value as UserRole],
                })
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="author">Tác giả</option>
              <option value="editor">Biên tập viên</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            onClick={handleSave}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Lưu thay đổi
          </button>
        </div>
      )}

      {activeTab === "permissions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Tùy chỉnh quyền riêng lẻ. Ô màu vàng = khác với mặc định vai trò.
            </p>
            <button
              onClick={resetToRoleDefaults}
              className="text-xs text-primary hover:underline"
            >
              Đặt lại mặc định vai trò
            </button>
          </div>

          {Object.entries(groups).map(([group, perms]) => (
            <div key={group} className="rounded-xl border border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-2.5 text-sm font-semibold text-foreground border-b border-border">
                {group}
              </div>
              <div className="divide-y divide-border">
                {perms.map((perm) => {
                  const isEnabled = user.permissions.includes(perm.key);
                  const isDefault = roleDefault.includes(perm.key);
                  const isDeviation = isEnabled !== isDefault;
                  return (
                    <label
                      key={perm.key}
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors ${isDeviation ? "bg-yellow-50" : ""}`}
                    >
                      <div>
                        <span className="text-sm text-foreground">{perm.label}</span>
                        {isDeviation && (
                          <span className="ml-2 text-xs text-orange-500">
                            {isEnabled ? "+ thêm" : "- bị xóa"}
                          </span>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => togglePermission(perm.key)}
                        className="h-4 w-4 rounded border-input text-primary accent-primary"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            onClick={handleSave}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Lưu phân quyền
          </button>
        </div>
      )}
    </div>
  );
}
