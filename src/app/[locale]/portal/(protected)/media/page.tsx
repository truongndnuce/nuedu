"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Copy, Trash2, X } from "lucide-react";
import { UploadDropzone } from "@/components/portal/media/UploadDropzone";
import type { UploadResult } from "@/lib/api/uploadLocal";

interface MediaItem {
  url: string;
  name: string;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Load uploaded images from memory (would be API call in production)
  // In dev mode we just track what's been uploaded this session
  function handleUploaded(results: UploadResult[]) {
    setItems((prev) => [
      ...results.map((r) => ({ url: r.url, name: r.originalName })),
      ...prev,
    ]);
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(window.location.origin + url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Thư viện ảnh</h1>

      <UploadDropzone onUploaded={handleUploaded} />

      {items.length === 0 ? (
        <p className="text-center py-16 text-muted-foreground">
          Chưa có ảnh nào. Tải lên ảnh đầu tiên của bạn.
        </p>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {items.map((item, i) => (
            <button
              key={`${item.url}-${i}`}
              onClick={() => setSelected(item)}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted hover:ring-2 hover:ring-primary transition-all"
            >
              <Image
                src={item.url}
                alt={item.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* Side panel */}
      {selected && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 border-l border-border bg-background shadow-xl flex flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {selected.name}
            </h3>
            <button
              onClick={() => setSelected(null)}
              className="rounded p-1 hover:bg-muted transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 p-4 space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={selected.url}
                alt={selected.name}
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">URL</p>
              <code className="block text-xs bg-muted rounded p-2 break-all text-foreground">
                {selected.url}
              </code>
            </div>
            <button
              onClick={() => copyUrl(selected.url)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <Copy size={14} />
              {copied ? "Đã sao chép!" : "Sao chép URL"}
            </button>
            <button
              onClick={() => {
                setItems((prev) =>
                  prev.filter((i) => i.url !== selected.url)
                );
                setSelected(null);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive hover:bg-destructive/20 transition-colors"
            >
              <Trash2 size={14} />
              Xóa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
