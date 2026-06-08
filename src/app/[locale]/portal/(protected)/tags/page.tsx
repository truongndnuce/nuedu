"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import {
  getAllTags,
  updateTag,
  createTag,
  deleteTag,
  type Tag,
} from "@/fixtures/tags";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>(getAllTags);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVi, setEditVi] = useState("");
  const [editEn, setEditEn] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newVi, setNewVi] = useState("");
  const [newEn, setNewEn] = useState("");

  function startEdit(tag: Tag) {
    setEditing(tag.id);
    setEditVi(tag.nameVi);
    setEditEn(tag.nameEn);
  }

  function saveEdit(id: string) {
    updateTag(id, { nameVi: editVi, nameEn: editEn });
    setTags(getAllTags());
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm("Xóa thẻ này?")) return;
    deleteTag(id);
    setTags(getAllTags());
  }

  function handleCreate() {
    if (!newVi) return;
    createTag({
      slug: newVi.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      nameVi: newVi,
      nameEn: newEn || newVi,
    });
    setTags(getAllTags());
    setAddingNew(false);
    setNewVi("");
    setNewEn("");
  }

  return (
    <div className="space-y-6">
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
