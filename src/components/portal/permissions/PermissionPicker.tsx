"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import {
  createPermission,
  deletePermission,
  type PermissionDef,
} from "@/lib/api/users.api";
import { useAuth } from "@/lib/auth/useAuth";

function groupByGroup(perms: PermissionDef[]): Record<string, PermissionDef[]> {
  const groups: Record<string, PermissionDef[]> = {};
  for (const p of perms) {
    groups[p.group] = groups[p.group] ?? [];
    groups[p.group].push(p);
  }
  return groups;
}

interface PermissionPickerProps {
  allPerms: PermissionDef[];
  setAllPerms: React.Dispatch<React.SetStateAction<PermissionDef[]>>;
  selectedPerms: Set<string>;
  setSelectedPerms: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function PermissionPicker({
  allPerms,
  setAllPerms,
  selectedPerms,
  setSelectedPerms,
}: PermissionPickerProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [showNewForm, setShowNewForm] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function handleCreate() {
    const key = newKey.trim();
    const group = newGroup.trim();
    if (!key || !group) {
      setFormError("Key và nhóm là bắt buộc");
      return;
    }
    setCreating(true);
    setFormError(null);
    try {
      const perm = await createPermission({
        key,
        group,
        description: newDescription.trim() || undefined,
      });
      setAllPerms((prev) => [...prev, perm]);
      setSelectedPerms((prev) => new Set(prev).add(perm.key));
      setNewKey("");
      setNewGroup("");
      setNewDescription("");
      setShowNewForm(false);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Lỗi khi tạo quyền mới");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(perm: PermissionDef) {
    if (!confirm(`Xóa quyền "${perm.key}"? Quyền này sẽ bị gỡ khỏi mọi vai trò/người dùng đang có.`)) return;
    setDeletingId(perm.id);
    try {
      await deletePermission(perm.id);
      setAllPerms((prev) => prev.filter((p) => p.id !== perm.id));
      setSelectedPerms((prev) => {
        const next = new Set(prev);
        next.delete(perm.key);
        return next;
      });
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Lỗi khi xóa quyền");
    } finally {
      setDeletingId(null);
    }
  }

  const groups = groupByGroup(allPerms);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Phân quyền</h2>
        <span className="text-xs text-muted-foreground">
          {selectedPerms.size} / {allPerms.length} quyền được chọn
        </span>
      </div>

      {formError && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {formError}
          <button className="ml-2 underline" onClick={() => setFormError(null)}>Đóng</button>
        </div>
      )}

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
                <div key={perm.key} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
                  <label className="flex-1 cursor-pointer">
                    <span className="text-sm text-foreground">{perm.description ?? perm.key}</span>
                    <span className="ml-2 text-xs text-muted-foreground font-mono">{perm.key}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPerms.has(perm.key)}
                      onChange={() => togglePerm(perm.key)}
                      className="h-4 w-4 rounded border-input text-primary accent-primary"
                    />
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(perm)}
                        disabled={deletingId === perm.id}
                        title="Xóa quyền này"
                        className="rounded p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {isAdmin && (
        <div className="rounded-xl border border-dashed border-border p-4">
          {showNewForm ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Thêm quyền mới</span>
                <button
                  type="button"
                  onClick={() => { setShowNewForm(false); setFormError(null); }}
                  className="rounded p-1 hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Key <span className="text-muted-foreground font-normal">(vd: events.manage)</span>
                  </label>
                  <input
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="events.manage"
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Nhóm</label>
                  <input
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    placeholder="events"
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Mô tả <span className="text-muted-foreground font-normal">(tùy chọn)</span>
                </label>
                <input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="CRUD events"
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {creating ? "Đang tạo..." : "Tạo quyền"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Plus size={15} />
              Thêm quyền mới
            </button>
          )}
        </div>
      )}
    </div>
  );
}
