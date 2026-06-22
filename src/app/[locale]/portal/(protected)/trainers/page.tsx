"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { PermissionGate } from "@/components/portal/PermissionGate";
import {
  adminListTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  type ApiTrainer,
  type CreateTrainerPayload,
} from "@/lib/api/trainers.api";

const emptyForm: CreateTrainerPayload = {
  nameVi: "",
  nameEn: "",
  titleVi: "",
  titleEn: "",
  bioVi: "",
  bioEn: "",
  avatar: "",
  specialties: [],
  order: 0,
  isActive: true,
};

export default function TrainersPortalPage() {
  const [trainers, setTrainers] = useState<ApiTrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateTrainerPayload>(emptyForm);
  const [specialtiesRaw, setSpecialtiesRaw] = useState("");

  useEffect(() => {
    adminListTrainers()
      .then(setTrainers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setSpecialtiesRaw("");
    setModalOpen(true);
  }

  function openEdit(trainer: ApiTrainer) {
    setEditingId(trainer.id);
    setForm({
      nameVi: trainer.nameVi,
      nameEn: trainer.nameEn,
      titleVi: trainer.titleVi,
      titleEn: trainer.titleEn,
      bioVi: trainer.bioVi,
      bioEn: trainer.bioEn,
      avatar: trainer.avatar,
      specialties: trainer.specialties,
      order: trainer.order,
      isActive: trainer.isActive,
    });
    setSpecialtiesRaw(trainer.specialties.join(", "));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
  }

  function setField<K extends keyof CreateTrainerPayload>(
    key: K,
    value: CreateTrainerPayload[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    const specialties = specialtiesRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = { ...form, specialties };

    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateTrainer(editingId, payload);
        setTrainers((prev) =>
          prev.map((t) => (t.id === editingId ? updated : t)),
        );
      } else {
        const created = await createTrainer(payload);
        setTrainers((prev) => [...prev, created]);
      }
      closeModal();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa giảng viên này?")) return;
    try {
      await deleteTrainer(id);
      setTrainers((prev) => prev.filter((t) => t.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi xóa");
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
        <h1 className="text-2xl font-bold text-foreground">Giảng viên</h1>
        <PermissionGate need="trainers.manage">
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} />
            Thêm giảng viên
          </button>
        </PermissionGate>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12">
                #
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Tên (VI / EN)
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Chức danh
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Trạng thái
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trainers.map((trainer) => (
              <tr
                key={trainer.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {trainer.order}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">
                    {trainer.nameVi}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {trainer.nameEn}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-foreground">{trainer.titleVi}</div>
                  <div className="text-xs text-muted-foreground">
                    {trainer.titleEn}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      trainer.isActive
                        ? "inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                        : "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {trainer.isActive ? "Hiển thị" : "Ẩn"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <PermissionGate need="trainers.manage">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => openEdit(trainer)}
                        className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-muted"
                        title="Sửa"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(trainer.id)}
                        className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-muted"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </PermissionGate>
                </td>
              </tr>
            ))}
            {trainers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Chưa có giảng viên nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-background border border-border shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {editingId ? "Sửa giảng viên" : "Thêm giảng viên mới"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded p-1 text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Tên (Tiếng Việt) *
                  </label>
                  <input
                    value={form.nameVi}
                    onChange={(e) => setField("nameVi", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Name (English) *
                  </label>
                  <input
                    value={form.nameEn}
                    onChange={(e) => setField("nameEn", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Chức danh (VI) *
                  </label>
                  <input
                    value={form.titleVi}
                    onChange={(e) => setField("titleVi", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Title (EN) *
                  </label>
                  <input
                    value={form.titleEn}
                    onChange={(e) => setField("titleEn", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Bio (VI) *
                  </label>
                  <textarea
                    rows={3}
                    value={form.bioVi}
                    onChange={(e) => setField("bioVi", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Bio (EN) *
                  </label>
                  <textarea
                    rows={3}
                    value={form.bioEn}
                    onChange={(e) => setField("bioEn", e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </div>
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  URL ảnh đại diện *
                </label>
                <input
                  value={form.avatar}
                  onChange={(e) => setField("avatar", e.target.value)}
                  placeholder="/images/trainers/..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Chuyên môn (cách nhau bởi dấu phẩy)
                </label>
                <input
                  value={specialtiesRaw}
                  onChange={(e) => setSpecialtiesRaw(e.target.value)}
                  placeholder="Bodybuilding, Strength Training, Muscle Gain"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Order + isActive */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setField("order", parseInt(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setField("isActive", e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-foreground"
                  >
                    Hiển thị trên trang public
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
              <button
                onClick={closeModal}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
