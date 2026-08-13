"use client";

import { useState } from "react";
import { submitLead } from "@/lib/api/leads.api";

interface Props {
  locale: string;
}

const vi = {
  fullName: "Họ và tên *",
  address: "Địa chỉ *",
  phone: "Điện thoại *",
  content: "Nội dung liên hệ *",
  submit: "Gửi liên hệ",
  submitting: "Đang gửi...",
  successTitle: "Gửi liên hệ thành công!",
  successMsg: "Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.",
  error: "Có lỗi xảy ra, vui lòng thử lại.",
};

const en = {
  fullName: "Full Name *",
  address: "Address *",
  phone: "Phone *",
  content: "Message *",
  submit: "Send message",
  submitting: "Submitting...",
  successTitle: "Message sent!",
  successMsg: "We will contact you as soon as possible.",
  error: "An error occurred, please try again.",
};

export function ContactForm({ locale }: Props) {
  const t = locale === "vi" ? vi : en;
  const [form, setForm] = useState({ fullName: "", address: "", phone: "", content: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const set =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      await submitLead(form);
      setStatus("success");
      setForm({ fullName: "", address: "", phone: "", content: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full rounded border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
          ✓
        </div>
        <p className="mt-4 text-lg font-bold text-foreground">{t.successTitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t.successMsg}</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 rounded bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {locale === "vi" ? "Gửi liên hệ khác" : "Send another message"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 sm:p-8">
      <input required placeholder={t.fullName} value={form.fullName} onChange={set("fullName")} className={inputClass} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input required placeholder={t.phone} value={form.phone} onChange={set("phone")} className={inputClass} />
        <input required placeholder={t.address} value={form.address} onChange={set("address")} className={inputClass} />
      </div>
      <textarea
        required
        rows={5}
        placeholder={t.content}
        value={form.content}
        onChange={set("content")}
        className={`${inputClass} resize-none`}
      />
      {status === "error" && <p className="text-xs text-destructive">{t.error}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-1 rounded bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {status === "submitting" ? t.submitting : t.submit}
      </button>
    </form>
  );
}
