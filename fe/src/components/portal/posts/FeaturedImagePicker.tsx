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
  images: FeaturedImageResult[];
  onChange: (images: FeaturedImageResult[]) => void;
}

export function FeaturedImagePicker({ images, onChange }: FeaturedImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      let current = images;
      for (const file of imageFiles) {
        const result = await uploadFile(file, "posts");
        current = [...current, { mediaId: result.mediaId, url: result.url }];
        onChange(current);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi tải ảnh lên");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-1.5">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img, index) => (
            <div key={img.mediaId} className="relative">
              <div className="relative h-24 w-full overflow-hidden rounded-lg">
                <Image src={img.url} alt="" fill className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
              >
                <X size={12} />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  Ảnh đại diện
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && inputRef.current?.click()}
        className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors"
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
              Kéo thả hoặc nhấn để thêm ảnh
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
