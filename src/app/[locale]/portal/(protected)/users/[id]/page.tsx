"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import {
  getUser,
  updateUser,
  getUserPermissions,
  updateUserPermissions,
  listAllPermissions,
  getRoleDefaults,
  type ApiUser,
  type UserRole,
  type PermissionDef,
  type UserPermissions,
} from "@/lib/api/users.api";
import { listRoles, type ApiCustomRole } from "@/lib/api/roles.api";

function groupByGroup(perms: PermissionDef[]): Record<string, PermissionDef[]> {
  const groups: Record<string, PermissionDef[]> = {};
  for (const p of perms) {
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

  const [user, setUser] = useState<ApiUser | null>(null);
  const [effectivePerms, setEffectivePerms] = useState<string[]>([]);
  const [allPerms, setAllPerms] = useState<PermissionDef[]>([]);
  const [roleDefaults, setRoleDefaults] = useState<Record<UserRole, string[]>>({
    ADMIN: [],
    STAFF: [],
  });
  const [customRoles, setCustomRoles] = useState<ApiCustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "permissions">(
    "profile",
  );

  // Editable profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("STAFF");
  const [customRoleId, setCustomRoleId] = useState<string>("");

  useEffect(() => {
    Promise.all([
      getUser(id),
      getUserPermissions(id),
      listAllPermissions(),
      getRoleDefaults(),
      listRoles(),
    ])
      .then(([u, permsData, allP, roleDefs, roles]) => {
        setUser(u);
        setFullName(u.fullName);
        setEmail(u.email);
        setRole(u.role);
        setCustomRoleId(u.customRoleId ?? "");
        setEffectivePerms(permsData.effective);
        setAllPerms(allP);
        setRoleDefaults(roleDefs as Record<UserRole, string[]>);
        setCustomRoles(roles);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function togglePermission(key: string) {
    setEffectivePerms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  }

  function resetToRoleDefaults() {
    setEffectivePerms(roleDefaults[role] ?? []);
  }

  async function handleSaveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateUser(id, {
        fullName,
        email,
        role,
        customRoleId: customRoleId || null,
      });
      setUser(updated);
      // Reset permissions to new role defaults when role changes
      if (updated.role !== user.role) {
        setEffectivePerms(roleDefaults[updated.role] ?? []);
      }
      router.push(`/${locale}/portal/users`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePermissions() {
    if (!user) return;
    setSaving(true);
    try {
      const currentRoleDefaults = new Set(roleDefaults[user.role] ?? []);
      // Only send deviations from role defaults
      const overrides = allPerms
        .map((p) => {
          const granted = effectivePerms.includes(p.key);
          const isDefault = currentRoleDefaults.has(p.key);
          if (granted !== isDefault) {
            return { key: p.key, granted };
          }
          return null;
        })
        .filter((x): x is { key: string; granted: boolean } => x !== null);

      await updateUserPermissions(id, overrides);
      router.push(`/${locale}/portal/users`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi lưu phân quyền");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Không tìm thấy người dùng
      </div>
    );
  }

  const groups = groupByGroup(allPerms);
  const currentRoleDefaults = new Set(roleDefaults[user.role] ?? []);

  return (
    <div className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>
            Đóng
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-foreground">
          Chỉnh sửa người dùng
        </h1>
      </div>

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
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tên
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Cấp độ hệ thống
            </label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as UserRole);
                if (e.target.value === "ADMIN") setCustomRoleId("");
              }}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="STAFF">Nhân viên</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {role === "STAFF" && customRoles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Vai trò tùy chỉnh <span className="text-muted-foreground font-normal">(tùy chọn)</span>
              </label>
              <select
                value={customRoleId}
                onChange={(e) => setCustomRoleId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— Không có (dùng quyền mặc định STAFF) —</option>
                {customRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      )}

      {activeTab === "permissions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Tùy chỉnh quyền riêng lẻ. Ô màu vàng = khác với mặc định vai
              trò.
            </p>
            <button
              onClick={resetToRoleDefaults}
              className="text-xs text-primary hover:underline"
            >
              Đặt lại mặc định vai trò
            </button>
          </div>

          {Object.entries(groups).map(([group, perms]) => (
            <div
              key={group}
              className="rounded-xl border border-border overflow-hidden"
            >
              <div className="bg-muted/50 px-4 py-2.5 text-sm font-semibold text-foreground border-b border-border">
                {group}
              </div>
              <div className="divide-y divide-border">
                {perms.map((perm) => {
                  const isEnabled = effectivePerms.includes(perm.key);
                  const isDefault = currentRoleDefaults.has(perm.key);
                  const isDeviation = isEnabled !== isDefault;
                  return (
                    <label
                      key={perm.key}
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors ${isDeviation ? "bg-yellow-50" : ""}`}
                    >
                      <div>
                        <span className="text-sm text-foreground">
                          {perm.description ?? perm.key}
                        </span>
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
            onClick={handleSavePermissions}
            disabled={saving}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving ? "Đang lưu..." : "Lưu phân quyền"}
          </button>
        </div>
      )}
    </div>
  );
}
