"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import {
  getRoleDefaults,
  updateRoleDefaults,
  listAllPermissions,
  roleLabel,
  type PermissionDef,
  type UserRole,
} from "@/lib/api/users.api";
import { PermissionPicker } from "@/components/portal/permissions/PermissionPicker";

export default function EditSystemRolePage({ params }: { params: Promise<{ role: string }> }) {
  const { role: roleParam } = use(params);
  const role = roleParam.toUpperCase() as UserRole;
  const router = useRouter();
  const locale = useLocale();

  const [allPerms, setAllPerms] = useState<PermissionDef[]>([]);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getRoleDefaults(), listAllPermissions()])
      .then(([defaults, allP]) => {
        setSelectedPerms(new Set(defaults[role] ?? []));
        setAllPerms(allP);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [role]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateRoleDefaults(role, Array.from(selectedPerms));
      router.push(`/${locale}/portal/roles`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi lưu quyền");
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

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Quyền vai trò: {roleLabel(role)}</h1>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>Đóng</button>
        </div>
      )}

      <PermissionPicker
        allPerms={allPerms}
        setAllPerms={setAllPerms}
        selectedPerms={selectedPerms}
        setSelectedPerms={setSelectedPerms}
      />

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-border px-5 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
