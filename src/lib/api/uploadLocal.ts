"use client";

import { signUpload, confirmUpload, type UploadFolder } from "./media.api";

export interface UploadResult {
  mediaId: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export async function uploadFile(
  file: File,
  folder: UploadFolder = "posts",
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  // Step 1: Get signed upload params from our backend
  onProgress?.(5);
  const sign = await signUpload({
    folder,
    resourceType: "image",
    filename: file.name,
    mimeType: file.type,
    size: file.size,
  });

  // Step 2: Upload directly to Cloudinary
  onProgress?.(20);
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("signature", sign.signature);
  form.append("public_id", sign.publicId);
  form.append("folder", folder);

  const cloudRes = await fetch(sign.uploadUrl, { method: "POST", body: form });
  onProgress?.(80);

  if (!cloudRes.ok) {
    const err = await cloudRes.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? "Upload to Cloudinary failed");
  }

  const cloudData = await cloudRes.json() as Record<string, unknown>;

  // Step 3: Confirm with our backend — only send fields the DTO expects
  const media = await confirmUpload(sign.mediaId, {
    public_id: cloudData.public_id as string,
    version: cloudData.version as number,
    secure_url: cloudData.secure_url as string,
    format: cloudData.format as string | undefined,
    width: cloudData.width as number | undefined,
    height: cloudData.height as number | undefined,
    bytes: cloudData.bytes as number,
    resource_type: cloudData.resource_type as string,
    signature: cloudData.signature as string,
  });
  onProgress?.(100);

  return {
    mediaId: media.id,
    url: media.cloudinaryUrl,
    originalName: media.originalName,
    size: media.size,
    mimeType: media.mimeType,
  };
}
