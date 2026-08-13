import { apiFetch } from "./client";

export interface ApiTestimonial {
  id: string;
  name: string;
  role: string | null;
  contentVi: string;
  contentEn: string;
  avatar: string | null;
  order: number;
  isActive: boolean;
}

export type CreateTestimonialPayload = {
  name: string;
  role?: string;
  contentVi: string;
  contentEn: string;
  avatar?: string;
  order?: number;
  isActive?: boolean;
};

export type UpdateTestimonialPayload = Partial<CreateTestimonialPayload>;

export function adminListTestimonials(): Promise<ApiTestimonial[]> {
  return apiFetch("/testimonials/admin");
}

export function createTestimonial(
  dto: CreateTestimonialPayload,
): Promise<ApiTestimonial> {
  return apiFetch("/testimonials", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateTestimonial(
  id: string,
  dto: UpdateTestimonialPayload,
): Promise<ApiTestimonial> {
  return apiFetch(`/testimonials/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteTestimonial(id: string): Promise<void> {
  return apiFetch(`/testimonials/${id}`, { method: "DELETE" });
}
