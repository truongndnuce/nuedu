// Same interface as MinIO upload flow — swap internals when backend is ready
export interface UploadResult {
  mediaId: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export async function uploadFile(
  file: File,
  _scope: "public" | "private" = "public",
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  // Simulate progress since fetch doesn't support it natively
  onProgress?.(10);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  onProgress?.(100);

  if (!res.ok) throw new Error("Upload failed");
  return res.json() as Promise<UploadResult>;
}
