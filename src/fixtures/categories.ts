import { categories as postCategories } from "./posts";

export interface Category {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
}

let categoriesStore: Category[] = postCategories.map((c, i) => ({
  id: String(i + 1),
  ...c,
}));

export function getAllCategories(): Category[] {
  return categoriesStore;
}

export function updateCategory(id: string, data: Partial<Category>): boolean {
  const idx = categoriesStore.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  categoriesStore[idx] = { ...categoriesStore[idx], ...data };
  return true;
}

export function createCategory(data: Omit<Category, "id">): Category {
  const cat: Category = { ...data, id: String(Date.now()) };
  categoriesStore = [...categoriesStore, cat];
  return cat;
}

export function deleteCategory(id: string): boolean {
  const len = categoriesStore.length;
  categoriesStore = categoriesStore.filter((c) => c.id !== id);
  return categoriesStore.length < len;
}
