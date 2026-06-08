"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { uploadFile, type UploadResult } from "@/lib/api/uploadLocal";

interface UploadDropzoneProps {
  onUploaded: (results: UploadResult[]) => void;
}

export function UploadDropzone({ onUploaded }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});

  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!fileArray.length) return;

    setUploading(true);
    const results: UploadResult[] = [];

    for (const file of fileArray) {
      try {
        const result = await uploadFile(file, "public", (pct) => {
          setProgress((prev) => ({ ...prev, [file.name]: pct }));
        });
        results.push(result);
      } catch {
        // skip failed files
      }
    }

    setUploading(false);
    setProgress({});
    if (results.length > 0) onUploaded(results);
  }

  return (
    <div
      onDrop={(e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
      }}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 py-10 hover:bg-muted/40 transition-colors"
    >
      {uploading ? (
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Đang tải lên...</p>
          {Object.entries(progress).map(([name, pct]) => (
            <p key={name} className="text-xs text-muted-foreground">
              {name}: {pct}%
            </p>
          ))}
        </div>
      ) : (
        <>
          <Upload size={28} className="text-muted-foreground" />
          <p className="mt-2 text-sm font-medium text-foreground">
            Kéo thả hoặc nhấn để tải ảnh lên
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Hỗ trợ đa file. Chỉ nhận ảnh.
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
          if (e.target.files) handleFiles(e.target.files);
        }}
      />
    </div>
  );
}
