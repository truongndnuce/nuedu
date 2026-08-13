"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { createRole } from "@/lib/api/roles.api";
import { listAllPermissions, type PermissionDef } from "@/lib/api/users.api";
import { updateRolePermissions } from "@/lib/api/roles.api";
import { PermissionPicker } from "@/components/portal/permissions/PermissionPicker";

export default function NewRolePage() {
  const router = useRouter();
  const locale = useLocale();
  const [allPerms, setAllPerms] = useState<PermissionDef[]>([]);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listAllPermissions().then(setAllPerms).catch(() => {});
  }, []);

  async function handleSave() {
    if (!name.trim()) { setError("Tên vai trò bắt buộc"); return; }
    setSaving(true);
    setError(null);
    try {
      const role = await createRole({ name: name.trim(), description: description.trim() || undefined });
      if (selectedPerms.size > 0) {
        await updateRolePermissions(role.id, Array.from(selectedPerms));
      }
      router.push(`/${locale}/portal/roles`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi tạo vai trò");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Tạo vai trò mới</h1>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Tên vai trò</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Biên tập viên"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Mô tả <span className="text-muted-foreground font-normal">(tùy chọn)</span>
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn về vai trò này..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

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
          {saving ? "Đang lưu..." : "Tạo vai trò"}
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
