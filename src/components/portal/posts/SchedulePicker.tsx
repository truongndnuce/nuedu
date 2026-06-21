"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import { CalendarClock, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostStatus } from "@/lib/api/posts.api";

interface SchedulePickerProps {
  currentStatus: PostStatus;
  scheduledAt?: string;
  onSchedule: (isoDate: string) => Promise<void>;
  onUnschedule: () => Promise<void>;
  disabled?: boolean;
}

function toDatetimeLocalValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function SchedulePicker({
  currentStatus,
  scheduledAt,
  onSchedule,
  onUnschedule,
  disabled,
}: SchedulePickerProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);

  const minValue = toDatetimeLocalValue(new Date(Date.now() + 60_000));

  async function handleSchedule() {
    if (!value) return;
    const selected = new Date(value);
    if (selected <= new Date(Date.now() + 60_000)) {
      setError("Thời gian phải ít nhất 1 phút trong tương lai");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSchedule(selected.toISOString());
      setValue("");
      setShowReschedule(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi lên lịch");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnschedule() {
    setLoading(true);
    setError(null);
    try {
      await onUnschedule();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi hủy lịch");
    } finally {
      setLoading(false);
    }
  }

  if (currentStatus === "SCHEDULED" && scheduledAt && !showReschedule) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-orange-600">
          <CalendarClock size={13} />
          <span className="font-medium">
            {format(new Date(scheduledAt), "HH:mm - dd/MM/yyyy", { locale: viLocale })}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowReschedule(true)}
            disabled={disabled || loading}
            className="flex-1 rounded-lg border border-orange-300 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-50 disabled:opacity-50 transition-colors"
          >
            Đổi lịch
          </button>
          <button
            type="button"
            onClick={handleUnschedule}
            disabled={disabled || loading}
            className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 size={12} className="animate-spin mx-auto" /> : "Hủy lịch"}
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {currentStatus === "SCHEDULED" && showReschedule && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Đang chọn lịch mới</span>
          <button
            type="button"
            onClick={() => { setShowReschedule(false); setError(null); }}
            className="rounded p-0.5 hover:bg-muted"
          >
            <X size={12} />
          </button>
        </div>
      )}
      <input
        type="datetime-local"
        value={value}
        min={minValue}
        onChange={(e) => { setValue(e.target.value); setError(null); }}
        disabled={disabled || loading}
        className={cn(
          "w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50",
          error && "border-destructive"
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="button"
        onClick={handleSchedule}
        disabled={disabled || loading || !value}
        className="w-full rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin mx-auto" />
        ) : currentStatus === "SCHEDULED" ? "Cập nhật lịch" : "Lên lịch"}
      </button>
    </div>
  );
}
