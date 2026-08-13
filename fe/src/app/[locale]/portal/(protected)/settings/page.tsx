"use client";

import { useEffect, useState } from "react";
import { Mail, Plus, Trash2, Save } from "lucide-react";
import { getLeadRecipients, setLeadRecipients } from "@/lib/api/settings.api";
import { useAuth } from "@/lib/auth/useAuth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SettingsPage() {
  const { user } = useAuth();
  const [emails, setEmails] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getLeadRecipients()
      .then(setEmails)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function addEmail() {
    const trimmed = input.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Email không hợp lệ");
      return;
    }
    if (emails.includes(trimmed)) {
      setError("Email đã có trong danh sách");
      return;
    }
    setEmails((prev) => [...prev, trimmed]);
    setInput("");
    setError(null);
  }

  function removeEmail(email: string) {
    setEmails((prev) => prev.filter((e) => e !== email));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await setLeadRecipients(emails);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  }

  if (user && user.role !== "admin") {
    return (
      <div className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cài đặt hệ thống</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý các cấu hình chung của hệ thống.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-primary" />
          <h2 className="font-semibold">Email nhận đăng ký tư vấn</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Khi có người gửi form đăng ký, hệ thống sẽ gửi thông báo đến các địa
          chỉ email dưới đây.
        </p>

        {/* Email list */}
        <div className="space-y-2">
          {emails.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              Chưa có email nào được cấu hình
            </p>
          ) : (
            emails.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2"
              >
                <span className="text-sm font-mono">{email}</span>
                <button
                  onClick={() => removeEmail(email)}
                  className="ml-4 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="Xóa email"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add email input */}
        <div className="flex gap-2">
          <input
            type="email"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && addEmail()}
            placeholder="Nhập địa chỉ email..."
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            onClick={addEmail}
            className="flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <Plus size={15} />
            Thêm
          </button>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-600">Đã lưu thành công.</p>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            <Save size={15} />
            {saving ? "Đang lưu..." : "Lưu cài đặt"}
          </button>
        </div>
      </div>
    </div>
  );
}
