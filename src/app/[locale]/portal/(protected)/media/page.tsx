"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Copy, Trash2, X, ImageOff } from "lucide-react";
import { UploadDropzone } from "@/components/portal/media/UploadDropzone";
import { listMedia, deleteMedia, type MediaItem } from "@/lib/api/media.api";
import { PermissionGate } from "@/components/portal/PermissionGate";

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    listMedia({ limit: 100 })
      .then((res) => setItems(res.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleUploaded(results: { mediaId: string; url: string; originalName: string; size: number; mimeType: string }[]) {
    listMedia({ limit: 100 })
      .then((res) => setItems(res.items))
      .catch(() => { /* keep old list */ });
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(`Xóa ảnh "${item.originalName}"?`)) return;
    setDeleting(true);
    try {
      await deleteMedia(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (selected?.id === item.id) setSelected(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi xóa ảnh");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <PermissionGate
      needAny={["media.view", "media.upload", "media.delete.own", "media.delete.any"]}
      fallback={
        <div className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          Bạn không có quyền truy cập trang này.
        </div>
      }
    >
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Thư viện ảnh</h1>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="underline text-xs">Đóng</button>
        </div>
      )}

      <PermissionGate need="media.upload">
        <UploadDropzone onUploaded={handleUploaded} />
      </PermissionGate>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <ImageOff size={32} />
          <p className="text-sm">Chưa có ảnh nào. Tải lên ảnh đầu tiên của bạn.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted hover:ring-2 hover:ring-primary transition-all"
            >
              <Image
                src={item.cloudinaryUrl}
                alt={item.originalName}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 border-l border-border bg-background shadow-xl flex flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {selected.originalName}
            </h3>
            <button
              onClick={() => setSelected(null)}
              className="rounded p-1 hover:bg-muted transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={selected.cloudinaryUrl}
                alt={selected.originalName}
                fill
                className="object-contain"
              />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {selected.width && selected.height && (
                <p>{selected.width} × {selected.height}px</p>
              )}
              <p>{(selected.size / 1024).toFixed(1)} KB</p>
              {selected.format && <p className="uppercase">{selected.format}</p>}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">URL</p>
              <code className="block text-xs bg-muted rounded p-2 break-all text-foreground">
                {selected.cloudinaryUrl}
              </code>
            </div>
            <button
              onClick={() => copyUrl(selected.cloudinaryUrl)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <Copy size={14} />
              {copied ? "Đã sao chép!" : "Sao chép URL"}
            </button>
            <PermissionGate needAny={["media.delete.own", "media.delete.any"]}>
              <button
                onClick={() => handleDelete(selected)}
                disabled={deleting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive hover:bg-destructive/20 disabled:opacity-60 transition-colors"
              >
                <Trash2 size={14} />
                {deleting ? "Đang xóa..." : "Xóa ảnh"}
              </button>
            </PermissionGate>
          </div>
        </div>
      )}
    </div>
    </PermissionGate>
  );
}
