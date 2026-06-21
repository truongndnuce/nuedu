import { apiFetch } from "./client";

export interface Tag {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
}

export function listTags(search?: string): Promise<Tag[]> {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch(`/tags${q}`);
}

export function createTag(dto: {
  nameVi: string;
  nameEn: string;
  slug?: string;
}): Promise<Tag> {
  return apiFetch("/tags", { method: "POST", body: JSON.stringify(dto) });
}

export function updateTag(
  id: string,
  dto: { nameVi?: string; nameEn?: string },
): Promise<Tag> {
  return apiFetch(`/tags/${id}`, { method: "PATCH", body: JSON.stringify(dto) });
}

export function deleteTag(id: string): Promise<void> {
  return apiFetch(`/tags/${id}`, { method: "DELETE" });
}
