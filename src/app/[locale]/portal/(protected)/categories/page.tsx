"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import {
  getAllCategories,
  updateCategory,
  createCategory,
  deleteCategory,
  type Category,
} from "@/fixtures/categories";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(getAllCategories);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVi, setEditVi] = useState("");
  const [editEn, setEditEn] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newVi, setNewVi] = useState("");
  const [newEn, setNewEn] = useState("");
  const [newSlug, setNewSlug] = useState("");

  function startEdit(cat: Category) {
    setEditing(cat.id);
    setEditVi(cat.nameVi);
    setEditEn(cat.nameEn);
  }

  function saveEdit(id: string) {
    updateCategory(id, { nameVi: editVi, nameEn: editEn });
    setCategories(getAllCategories());
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm("Xóa danh mục này?")) return;
    deleteCategory(id);
    setCategories(getAllCategories());
  }

  function handleCreate() {
    if (!newVi || !newSlug) return;
    createCategory({
      slug: newSlug,
      nameVi: newVi,
      nameEn: newEn || newVi,
    });
    setCategories(getAllCategories());
    setAddingNew(false);
    setNewVi("");
    setNewEn("");
    setNewSlug("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Danh mục</h1>
        <button
          onClick={() => setAddingNew(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          Thêm danh mục
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
            {/* New row */}
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
                      setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                    }
                    placeholder="slug"
                    className="w-full rounded border border-input bg-background px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={handleCreate}
                      className="rounded p-1 text-primary hover:bg-muted"
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
                          className="rounded p-1 text-primary hover:bg-muted"
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
                      </>
                    )}
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
