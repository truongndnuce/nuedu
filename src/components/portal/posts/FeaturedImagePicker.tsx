"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { uploadFile } from "@/lib/api/uploadLocal";

export interface FeaturedImageResult {
  mediaId: string;
  url: string;
}

interface FeaturedImagePickerProps {
  previewUrl?: string;
  onChange: (result: FeaturedImageResult | undefined) => void;
}

export function FeaturedImagePicker({ previewUrl, onChange }: FeaturedImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadFile(file, "posts");
      onChange({ mediaId: result.mediaId, url: result.url });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi tải ảnh lên");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  }

  return (
    <div className="space-y-1.5">
      {previewUrl ? (
        <div className="relative">
          <div className="relative h-40 w-full overflow-hidden rounded-lg">
            <Image src={previewUrl} alt="Featured" fill className="object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute top-2 right-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs text-muted-foreground">Đang tải lên...</p>
            </div>
          ) : (
            <>
              <Upload size={20} className="text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Kéo thả hoặc nhấn để chọn ảnh
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
