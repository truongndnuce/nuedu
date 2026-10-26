import { apiFetch } from "./client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export interface ApiTrainer {
  id: string;
  slug: string | null;
  nameVi: string;
  titleVi: string;
  bioVi: string;
  headlineVi: string | null;
  contentVi: string | null;
  facebookUrl: string | null;
  avatar: string;
  specialties: string[];
  order: number;
  isActive: boolean;
}

export type CreateTrainerPayload = Omit<
  ApiTrainer,
  | "id"
  | "isActive"
  | "slug"
  | "headlineVi"
  | "contentVi"
  | "facebookUrl"
> & {
  isActive?: boolean;
  slug?: string;
  headlineVi?: string;
  contentVi?: string;
  facebookUrl?: string;
};

export type UpdateTrainerPayload = Partial<CreateTrainerPayload>;

export async function listTrainers(): Promise<ApiTrainer[]> {
  const res = await fetch(`${API_BASE}/trainers`);
  if (!res.ok) throw new Error("Failed to fetch trainers");
  return res.json();
}

export async function getTrainerBySlug(
  slug: string,
): Promise<ApiTrainer | null> {
  try {
    const res = await fetch(
      `${API_BASE}/trainers/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function trainerPath(locale: string, trainer: Pick<ApiTrainer, "id" | "slug">) {
  return `/${locale}/trainers/${trainer.slug ?? trainer.id}`;
}

export function adminListTrainers(): Promise<ApiTrainer[]> {
  return apiFetch("/trainers/admin");
}

export function createTrainer(dto: CreateTrainerPayload): Promise<ApiTrainer> {
  return apiFetch("/trainers", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateTrainer(
  id: string,
  dto: UpdateTrainerPayload,
): Promise<ApiTrainer> {
  return apiFetch(`/trainers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteTrainer(id: string): Promise<void> {
  return apiFetch(`/trainers/${id}`, { method: "DELETE" });
}
