import { apiFetch } from "./client";

export interface Category {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
}

export function listCategories(): Promise<Category[]> {
  return apiFetch("/categories");
}

export function listCategoriesAdmin(): Promise<Category[]> {
  return apiFetch("/categories/admin");
}

export function createCategory(dto: {
  nameVi: string;
  nameEn: string;
  slug?: string;
}): Promise<Category> {
  return apiFetch("/categories", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateCategory(
  id: string,
  dto: { nameVi?: string; nameEn?: string },
): Promise<Category> {
  return apiFetch(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteCategory(id: string): Promise<void> {
  return apiFetch(`/categories/${id}`, { method: "DELETE" });
}
