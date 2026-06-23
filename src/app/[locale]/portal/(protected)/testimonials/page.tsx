"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X, Quote } from "lucide-react";
import { PermissionGate } from "@/components/portal/PermissionGate";
import {
  adminListTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type ApiTestimonial,
  type CreateTestimonialPayload,
} from "@/lib/api/testimonials.api";

const emptyForm: CreateTestimonialPayload = {
  name: "",
  role: "",
  contentVi: "",
  contentEn: "",
  avatar: "",
  order: 0,
  isActive: true,
};

export default function TestimonialsPortalPage() {
  const [testimonials, setTestimonials] = useState<ApiTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateTestimonialPayload>(emptyForm);

  useEffect(() => {
    adminListTestimonials()
      .then(setTestimonials)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(t: ApiTestimonial) {
    setEditingId(t.id);
    setForm({
      name: t.name,
      role: t.role ?? "",
      contentVi: t.contentVi,
      contentEn: t.contentEn,
      avatar: t.avatar ?? "",
      order: t.order,
      isActive: t.isActive,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function set(field: keyof CreateTestimonialPayload, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.contentVi.trim() || !form.contentEn.trim()) return;
    setSaving(true);
    try {
      const payload: CreateTestimonialPayload = {
        ...form,
        role: form.role?.trim() || undefined,
        avatar: form.avatar?.trim() || undefined,
      };
      if (editingId) {
        const updated = await updateTestimonial(editingId, payload);
        setTestimonials((prev) =>
          prev.map((t) => (t.id === editingId ? updated : t))
        );
      } else {
        const created = await createTestimonial(payload);
        setTestimonials((prev) => [...prev, created]);
      }
      closeModal();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa feedback này?")) return;
    await deleteTestimonial(id);
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Feedback học viên</h1>
        <PermissionGate need="testimonials.manage">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={16} />
            Thêm feedback
          </button>
        </PermissionGate>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!loading && !error && testimonials.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-muted-foreground">
          <Quote size={36} className="mb-3 opacity-30" />
          <p className="text-sm">Chưa có feedback nào</p>
        </div>
      )}

      {testimonials.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Tên</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Vai trò</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Nội dung (VI)</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">Thứ tự</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">Hiện</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {testimonials.map((t) => (
                <tr key={t.id} className="bg-card hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.role ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs">
                    <p className="line-clamp-2">{t.contentVi}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{t.order}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t.isActive ? "Hiện" : "Ẩn"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <PermissionGate need="testimonials.manage">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(t)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Sửa"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Xóa"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-card shadow-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">
                {editingId ? "Sửa feedback" : "Thêm feedback mới"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Tên người đánh giá <span className="text-destructive">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Vai trò / Background
                  </label>
                  <input
                    value={form.role ?? ""}
                    onChange={(e) => set("role", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Học viên khóa PT 2024 · PT tại GYM XYZ"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Nội dung (Tiếng Việt) <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={form.contentVi}
                  onChange={(e) => set("contentVi", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Khóa học tuyệt vời, tôi học được rất nhiều kiến thức thực tế..."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Nội dung (English) <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={form.contentEn}
                  onChange={(e) => set("contentEn", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="The course was amazing, I learned so much practical knowledge..."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  URL ảnh đại diện
                </label>
                <input
                  value={form.avatar ?? ""}
                  onChange={(e) => set("avatar", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    value={form.order ?? 0}
                    onChange={(e) => set("order", parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive ?? true}
                      onChange={(e) => set("isActive", e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm font-medium text-foreground">Hiển thị trang chủ</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <button
                onClick={closeModal}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.contentVi.trim() || !form.contentEn.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
