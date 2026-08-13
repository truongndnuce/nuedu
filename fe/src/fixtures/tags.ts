export interface Tag {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
}

let tagsStore: Tag[] = [
  { id: "1", slug: "the-hinh", nameVi: "Thể hình", nameEn: "Bodybuilding" },
  { id: "2", slug: "suc-manh", nameVi: "Sức mạnh", nameEn: "Strength" },
  { id: "3", slug: "dinh-duong", nameVi: "Dinh dưỡng", nameEn: "Nutrition" },
  { id: "4", slug: "nguoi-moi", nameVi: "Người mới", nameEn: "Beginner" },
  { id: "5", slug: "tang-co", nameVi: "Tăng cơ", nameEn: "Muscle Gain" },
];

export function getAllTags(): Tag[] {
  return tagsStore;
}

export function updateTag(id: string, data: Partial<Tag>): boolean {
  const idx = tagsStore.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tagsStore[idx] = { ...tagsStore[idx], ...data };
  return true;
}

export function createTag(data: Omit<Tag, "id">): Tag {
  const tag: Tag = { ...data, id: String(Date.now()) };
  tagsStore = [...tagsStore, tag];
  return tag;
}

export function deleteTag(id: string): boolean {
  const len = tagsStore.length;
  tagsStore = tagsStore.filter((t) => t.id !== id);
  return tagsStore.length < len;
}
