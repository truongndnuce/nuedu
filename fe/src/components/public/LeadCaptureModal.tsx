"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { submitLead } from "@/lib/api/leads.api";

interface Props {
  locale: string;
  onClose: () => void;
}

const vi = {
  title: "ĐĂNG KÝ TƯ VẤN KHÓA HỌC NGHỀ PT GYM",
  hotline: "HOTLINE: 086.777.0689",
  hoursLabel: "GIỜ MỞ CỬA",
  days: "Các ngày trong tuần",
  hours: "6h00 - 21h00.",
  note: "Chúng tôi sẽ gọi điện hoặc gửi tin nhắn / email để xác nhận cuộc hẹn này.",
  fullName: "Họ và tên *",
  address: "Địa chỉ *",
  phone: "Điện thoại *",
  content: "Nội dung *",
  submit: "Gửi đăng ký",
  submitting: "Đang gửi...",
  successTitle: "Đăng ký thành công!",
  successMsg: "Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.",
  error: "Có lỗi xảy ra, vui lòng thử lại.",
};

const en = {
  title: "REGISTER FOR PT GYM COURSE CONSULTATION",
  hotline: "HOTLINE: 086.777.0689",
  hoursLabel: "OPENING HOURS",
  days: "Every day of the week",
  hours: "6:00 AM - 9:00 PM.",
  note: "We will call or send a message / email to confirm this appointment.",
  fullName: "Full Name *",
  address: "Address *",
  phone: "Phone *",
  content: "Message *",
  submit: "Submit",
  submitting: "Submitting...",
  successTitle: "Registration successful!",
  successMsg: "We will contact you as soon as possible.",
  error: "An error occurred, please try again.",
};

export function LeadCaptureModal({ locale, onClose }: Props) {
  const t = locale === "vi" ? vi : en;
  const [form, setForm] = useState({ fullName: "", address: "", phone: "", content: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      await submitLead(form);
      setStatus("success");
      setTimeout(onClose, 3000);
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full rounded border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl rounded-xl bg-card shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-secondary transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Left — info */}
          <div className="bg-primary p-8 text-primary-foreground">
            <h2 className="text-lg font-black leading-snug text-accent">
              {t.title}
            </h2>
            <p className="mt-4 text-sm text-primary-foreground/80">{t.hotline}</p>

            <div className="mt-6 border-t border-white/20 pt-5">
              <p className="text-xs font-black uppercase tracking-widest text-primary-foreground/60">
                {t.hoursLabel}
              </p>
              <p className="mt-2 text-sm font-semibold text-accent">{t.days}</p>
              <div className="mt-1 border-t border-white/20 pt-2">
                <p className="text-sm text-primary-foreground/80">{t.hours}</p>
              </div>
            </div>

            <p className="mt-6 text-sm leading-6 text-primary-foreground/70">
              {t.note}
            </p>
          </div>

          {/* Right — form */}
          <div className="p-8">
            {status === "success" ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
                  ✓
                </div>
                <p className="mt-4 text-lg font-bold text-foreground">{t.successTitle}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t.successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  required
                  placeholder={t.fullName}
                  value={form.fullName}
                  onChange={set("fullName")}
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    placeholder={t.address}
                    value={form.address}
                    onChange={set("address")}
                    className={inputClass}
                  />
                  <input
                    required
                    placeholder={t.phone}
                    value={form.phone}
                    onChange={set("phone")}
                    className={inputClass}
                  />
                </div>
                <textarea
                  required
                  rows={5}
                  placeholder={t.content}
                  value={form.content}
                  onChange={set("content")}
                  className={`${inputClass} resize-none`}
                />
                {status === "error" && (
                  <p className="text-xs text-destructive">{t.error}</p>
                )}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="mt-1 rounded bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {status === "submitting" ? t.submitting : t.submit}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
