"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { getRole, getRolePermissions, updateRole, updateRolePermissions, type ApiCustomRole } from "@/lib/api/roles.api";
import { listAllPermissions, type PermissionDef } from "@/lib/api/users.api";

function groupByGroup(perms: PermissionDef[]): Record<string, PermissionDef[]> {
  const groups: Record<string, PermissionDef[]> = {};
  for (const p of perms) {
    groups[p.group] = groups[p.group] ?? [];
    groups[p.group].push(p);
  }
  return groups;
}

export default function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const locale = useLocale();

  const [role, setRole] = useState<ApiCustomRole | null>(null);
  const [allPerms, setAllPerms] = useState<PermissionDef[]>([]);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getRole(id), getRolePermissions(id), listAllPermissions()])
      .then(([r, perms, allP]) => {
        setRole(r);
        setName(r.name);
        setDescription(r.description ?? "");
        setSelectedPerms(new Set(perms));
        setAllPerms(allP);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function togglePerm(key: string) {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleGroup(keys: string[]) {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      const allSelected = keys.every((k) => next.has(k));
      if (allSelected) keys.forEach((k) => next.delete(k));
      else keys.forEach((k) => next.add(k));
      return next;
    });
  }

  async function handleSave() {
    if (!name.trim()) { setError("Tên vai trò bắt buộc"); return; }
    setSaving(true);
    setError(null);
    try {
      await updateRole(id, { name: name.trim(), description: description.trim() || undefined });
      await updateRolePermissions(id, Array.from(selectedPerms));
      router.push(`/${locale}/portal/roles`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi lưu vai trò");
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

  if (!role) return null;

  const groups = groupByGroup(allPerms);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Chỉnh sửa vai trò</h1>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>Đóng</button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Tên vai trò</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Phân quyền</h2>
          <span className="text-xs text-muted-foreground">{selectedPerms.size} / {allPerms.length} quyền được chọn</span>
        </div>

        {Object.entries(groups).map(([group, perms]) => {
          const keys = perms.map((p) => p.key);
          const allSelected = keys.every((k) => selectedPerms.has(k));
          const someSelected = keys.some((k) => selectedPerms.has(k));

          return (
            <div key={group} className="rounded-xl border border-border overflow-hidden">
              <label className="flex items-center justify-between bg-muted/50 px-4 py-2.5 cursor-pointer border-b border-border hover:bg-muted/80 transition-colors">
                <span className="text-sm font-semibold text-foreground capitalize">{group}</span>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={() => toggleGroup(keys)}
                  className="h-4 w-4 rounded border-input text-primary accent-primary"
                />
              </label>
              <div className="divide-y divide-border">
                {perms.map((perm) => (
                  <label key={perm.key} className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors">
                    <div>
                      <span className="text-sm text-foreground">{perm.description ?? perm.key}</span>
                      <span className="ml-2 text-xs text-muted-foreground font-mono">{perm.key}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedPerms.has(perm.key)}
                      onChange={() => togglePerm(perm.key)}
                      className="h-4 w-4 rounded border-input text-primary accent-primary"
                    />
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

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
