import { apiFetch } from "./client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export interface ApiTrainer {
  id: string;
  nameVi: string;
  nameEn: string;
  titleVi: string;
  titleEn: string;
  bioVi: string;
  bioEn: string;
  avatar: string;
  specialties: string[];
  order: number;
  isActive: boolean;
}

export type CreateTrainerPayload = Omit<ApiTrainer, "id" | "isActive"> & {
  isActive?: boolean;
};

export type UpdateTrainerPayload = Partial<CreateTrainerPayload>;

export async function listTrainers(): Promise<ApiTrainer[]> {
  const res = await fetch(`${API_BASE}/trainers`);
  if (!res.ok) throw new Error("Failed to fetch trainers");
  return res.json();
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
