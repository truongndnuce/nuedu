"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { uploadFile } from "@/lib/api/uploadLocal";

interface FeaturedImagePickerProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

export function FeaturedImagePicker({ value, onChange }: FeaturedImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const result = await uploadFile(file, "public");
      onChange(result.url);
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
    <div>
      {value ? (
        <div className="relative">
          <div className="relative h-40 w-full overflow-hidden rounded-lg">
            <Image src={value} alt="Featured" fill className="object-cover" />
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
          onClick={() => inputRef.current?.click()}
          className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          {uploading ? (
            <p className="text-sm text-muted-foreground">Đang tải lên...</p>
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
            }}
          />
        </div>
      )}
    </div>
  );
}
