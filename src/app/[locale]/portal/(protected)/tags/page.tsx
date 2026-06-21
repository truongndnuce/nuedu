"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import {
  listTags,
  createTag,
  updateTag,
  deleteTag,
  type Tag,
} from "@/lib/api/tags.api";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVi, setEditVi] = useState("");
  const [editEn, setEditEn] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newVi, setNewVi] = useState("");
  const [newEn, setNewEn] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listTags()
      .then(setTags)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function startEdit(tag: Tag) {
    setEditing(tag.id);
    setEditVi(tag.nameVi);
    setEditEn(tag.nameEn);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const updated = await updateTag(id, { nameVi: editVi, nameEn: editEn });
      setTags((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditing(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi cập nhật");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa thẻ này?")) return;
    try {
      await deleteTag(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi xóa");
    }
  }

  async function handleCreate() {
    if (!newVi) return;
    setSaving(true);
    try {
      const tag = await createTag({
        nameVi: newVi,
        nameEn: newEn || newVi,
      });
      setTags((prev) => [...prev, tag]);
      setAddingNew(false);
      setNewVi("");
      setNewEn("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi tạo");
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
        <h1 className="text-2xl font-bold text-foreground">Thẻ</h1>
        <button
          onClick={() => setAddingNew(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          Thêm thẻ
        </button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Tên (VI)
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Name (EN)
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Slug
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {addingNew && (
              <tr className="bg-muted/20">
                <td className="px-4 py-2">
                  <input
                    value={newVi}
                    onChange={(e) => setNewVi(e.target.value)}
                    placeholder="Tên tiếng Việt"
                    className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    value={newEn}
                    onChange={(e) => setNewEn(e.target.value)}
                    placeholder="English name"
                    className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </td>
                <td className="px-4 py-2 text-xs text-muted-foreground font-mono">
                  {newVi.toLowerCase().replace(/\s+/g, "-")}
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={handleCreate}
                      disabled={saving}
                      className="rounded p-1 text-primary hover:bg-muted disabled:opacity-50"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setAddingNew(false)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {tags.map((tag) => (
              <tr key={tag.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  {editing === tag.id ? (
                    <input
                      value={editVi}
                      onChange={(e) => setEditVi(e.target.value)}
                      className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  ) : (
                    tag.nameVi
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing === tag.id ? (
                    <input
                      value={editEn}
                      onChange={(e) => setEditEn(e.target.value)}
                      className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  ) : (
                    tag.nameEn
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {tag.slug}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    {editing === tag.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(tag.id)}
                          disabled={saving}
                          className="rounded p-1 text-primary hover:bg-muted disabled:opacity-50"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="rounded p-1 text-muted-foreground hover:bg-muted"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(tag)}
                          className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-muted"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-muted"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {tags.length === 0 && !addingNew && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Chưa có thẻ nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
