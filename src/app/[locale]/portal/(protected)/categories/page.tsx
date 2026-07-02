"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import {
  listCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "@/lib/api/categories.api";
import { PermissionGate } from "@/components/portal/PermissionGate";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVi, setEditVi] = useState("");
  const [editEn, setEditEn] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newVi, setNewVi] = useState("");
  const [newEn, setNewEn] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listCategoriesAdmin()
      .then(setCategories)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function startEdit(cat: Category) {
    setEditing(cat.id);
    setEditVi(cat.nameVi);
    setEditEn(cat.nameEn);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const updated = await updateCategory(id, { nameVi: editVi, nameEn: editEn });
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditing(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi cập nhật");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa danh mục này?")) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi xóa");
    }
  }

  async function handleCreate() {
    if (!newVi || !newSlug) return;
    setSaving(true);
    try {
      const cat = await createCategory({
        slug: newSlug,
        nameVi: newVi,
        nameEn: newEn || newVi,
      });
      setCategories((prev) => [...prev, cat]);
      setAddingNew(false);
      setNewVi("");
      setNewEn("");
      setNewSlug("");
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
    <PermissionGate
      needAny={["categories.view", "categories.manage"]}
      fallback={
        <div className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          Bạn không có quyền truy cập trang này.
        </div>
      }
    >
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
        <h1 className="text-2xl font-bold text-foreground">Danh mục</h1>
        <PermissionGate need="categories.manage">
          <button
            onClick={() => setAddingNew(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} />
            Thêm danh mục
          </button>
        </PermissionGate>
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
                <td className="px-4 py-2">
                  <input
                    value={newSlug}
                    onChange={(e) =>
                      setNewSlug(
                        e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      )
                    }
                    placeholder="slug"
                    className="w-full rounded border border-input bg-background px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                  />
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
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  {editing === cat.id ? (
                    <input
                      value={editVi}
                      onChange={(e) => setEditVi(e.target.value)}
                      className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  ) : (
                    <span className="text-foreground">{cat.nameVi}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing === cat.id ? (
                    <input
                      value={editEn}
                      onChange={(e) => setEditEn(e.target.value)}
                      className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  ) : (
                    <span className="text-foreground">{cat.nameEn}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {cat.slug}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    {editing === cat.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(cat.id)}
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
                      <PermissionGate need="categories.manage">
                        <button
                          onClick={() => startEdit(cat)}
                          className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-muted"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-muted"
                        >
                          <Trash2 size={14} />
                        </button>
                      </PermissionGate>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && !addingNew && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Chưa có danh mục nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </PermissionGate>
  );
}
