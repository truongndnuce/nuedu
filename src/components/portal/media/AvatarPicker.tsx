"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { uploadFile } from "@/lib/api/uploadLocal";

interface AvatarPickerProps {
  value: string;
  onChange: (url: string) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | File[]) {
    const file = Array.from(files).find((f) => f.type.startsWith("image/"));
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const result = await uploadFile(file, "avatars");
      onChange(result.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi khi tải ảnh lên");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      {value ? (
        <div className="relative h-32 w-32">
          <div className="relative h-full w-full overflow-hidden rounded-lg border border-border">
            <Image src={value} alt="" fill className="object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          {uploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <>
              <Upload size={20} className="text-muted-foreground" />
              <p className="mt-2 px-2 text-center text-xs text-muted-foreground">
                Tải ảnh lên
              </p>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
