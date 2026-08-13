import { apiFetch } from "./client";

export type PostStatus = "PUBLISHED" | "DRAFT" | "SCHEDULED";

export interface ApiPost {
  id: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  excerptVi?: string;
  excerptEn?: string;
  contentVi?: string;
  contentEn?: string;
  status: PostStatus;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; fullName: string };
  category: { id: string; slug: string; nameVi: string; nameEn: string } | null;
  featuredImage: { id: string; cloudinaryUrl: string } | null;
  images: { id: string; cloudinaryUrl: string }[];
  tags: { id: string; slug: string; nameVi: string; nameEn: string }[];
  metaTitleVi?: string;
  metaTitleEn?: string;
  metaDescriptionVi?: string;
  metaDescriptionEn?: string;
}

export interface PostListResponse {
  items: ApiPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function listPosts(params?: {
  page?: number;
  limit?: number;
  status?: PostStatus;
}): Promise<PostListResponse> {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.status) q.set("status", params.status);
  const qs = q.toString();
  return apiFetch(`/posts${qs ? `?${qs}` : ""}`);
}

export function getPost(id: string): Promise<ApiPost> {
  return apiFetch(`/posts/${id}`);
}

export function createPost(dto: {
  titleVi: string;
  titleEn?: string;
  excerptVi?: string;
  excerptEn?: string;
  contentVi?: string;
  contentEn?: string;
  categoryId?: string;
  tagIds?: string[];
  imageIds?: string[];
  metaTitleVi?: string;
  metaTitleEn?: string;
  metaDescriptionVi?: string;
  metaDescriptionEn?: string;
}): Promise<ApiPost> {
  return apiFetch("/posts", { method: "POST", body: JSON.stringify(dto) });
}

export function updatePost(
  id: string,
  dto: {
    titleVi?: string;
    titleEn?: string;
    excerptVi?: string;
    excerptEn?: string;
    contentVi?: string;
    contentEn?: string;
    categoryId?: string;
    imageIds?: string[];
    metaTitleVi?: string;
    metaTitleEn?: string;
    metaDescriptionVi?: string;
    metaDescriptionEn?: string;
  },
): Promise<ApiPost> {
  return apiFetch(`/posts/${id}`, { method: "PATCH", body: JSON.stringify(dto) });
}

export function deletePost(id: string): Promise<void> {
  return apiFetch(`/posts/${id}`, { method: "DELETE" });
}

export function publishPost(id: string): Promise<ApiPost> {
  return apiFetch(`/posts/${id}/publish`, { method: "POST" });
}

export function unpublishPost(id: string): Promise<ApiPost> {
  return apiFetch(`/posts/${id}/unpublish`, { method: "POST" });
}

export function schedulePost(id: string, scheduledAt: string): Promise<ApiPost> {
  return apiFetch(`/posts/${id}/schedule`, {
    method: "POST",
    body: JSON.stringify({ scheduledAt }),
  });
}

export function unschedulePost(id: string): Promise<ApiPost> {
  return apiFetch(`/posts/${id}/unschedule`, { method: "POST" });
}

export function statusLabel(status: PostStatus): string {
  if (status === "PUBLISHED") return "Đã đăng";
  if (status === "SCHEDULED") return "Đã lên lịch";
  return "Nháp";
}

export function statusClass(status: PostStatus): string {
  if (status === "PUBLISHED") return "bg-green-100 text-green-700";
  if (status === "SCHEDULED") return "bg-orange-100 text-orange-700";
  return "bg-muted text-muted-foreground";
}
