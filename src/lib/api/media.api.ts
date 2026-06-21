import { apiFetch } from "./client";

export type UploadFolder = "posts" | "chat" | "avatars";

export interface MediaItem {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  resourceType: "IMAGE" | "VIDEO" | "RAW";
  cloudinaryId: string;
  cloudinaryUrl: string;
  folder: string;
  format?: string;
  width?: number;
  height?: number;
  isPrivate: boolean;
  status: "PENDING" | "CONFIRMED";
  createdAt: string;
  variants?: { thumbnail?: string; medium?: string; large?: string };
}

export interface MediaListResponse {
  items: MediaItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SignUploadResponse {
  mediaId: string;
  publicId: string;
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  uploadUrl: string;
}

export function signUpload(params: {
  folder: UploadFolder;
  resourceType: "image" | "raw" | "video";
  filename: string;
  mimeType: string;
  size: number;
}): Promise<SignUploadResponse> {
  return apiFetch("/media/sign-upload", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function confirmUpload(
  mediaId: string,
  data: {
    public_id: string;
    version: number;
    secure_url: string;
    format?: string;
    width?: number;
    height?: number;
    bytes: number;
    resource_type: string;
    signature: string;
  },
): Promise<MediaItem> {
  return apiFetch(`/media/${mediaId}/confirm`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function listMedia(params?: {
  page?: number;
  limit?: number;
  resourceType?: "IMAGE" | "VIDEO" | "RAW";
  folder?: UploadFolder;
}): Promise<MediaListResponse> {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.resourceType) q.set("resourceType", params.resourceType);
  if (params?.folder) q.set("folder", params.folder);
  const qs = q.toString();
  return apiFetch(`/media${qs ? `?${qs}` : ""}`);
}

export function deleteMedia(id: string): Promise<void> {
  return apiFetch(`/media/${id}`, { method: "DELETE" });
}
