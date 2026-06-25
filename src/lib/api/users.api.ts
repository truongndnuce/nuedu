import { apiFetch } from "./client";

export type UserRole = "ADMIN" | "STAFF";

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  customRoleId?: string | null;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  items: ApiUser[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface UserPermissions {
  role: UserRole;
  roleDefaults: string[];
  overrides: { key: string; granted: boolean }[];
  effective: string[];
}

export interface PermissionDef {
  id: string;
  key: string;
  group: string;
  description?: string;
}

export function createUser(dto: {
  fullName: string;
  email: string;
  role?: UserRole;
  customRoleId?: string;
}): Promise<ApiUser & { temporaryPassword?: string }> {
  return apiFetch("/users", { method: "POST", body: JSON.stringify(dto) });
}

export function updateSelfProfile(dto: {
  fullName?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<void> {
  return apiFetch("/auth/me", { method: "PATCH", body: JSON.stringify(dto) });
}

export function listUsers(params?: {
  page?: number;
  limit?: number;
}): Promise<UserListResponse> {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  const qs = q.toString();
  return apiFetch(`/users${qs ? `?${qs}` : ""}`);
}

export function getUser(id: string): Promise<ApiUser> {
  return apiFetch(`/users/${id}`);
}

export function updateUser(
  id: string,
  dto: { fullName?: string; email?: string; role?: UserRole; customRoleId?: string | null },
): Promise<ApiUser> {
  return apiFetch(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deactivateUser(id: string): Promise<ApiUser> {
  return apiFetch(`/users/${id}`, { method: "DELETE" });
}

export function getUserPermissions(id: string): Promise<UserPermissions> {
  return apiFetch(`/users/${id}/permissions`);
}

export function updateUserPermissions(
  id: string,
  permissions: { key: string; granted: boolean }[],
): Promise<void> {
  return apiFetch(`/users/${id}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissions }),
  });
}

export function listAllPermissions(): Promise<PermissionDef[]> {
  return apiFetch("/permissions");
}

export function getRoleDefaults(): Promise<Record<UserRole, string[]>> {
  return apiFetch("/permissions/role-defaults");
}

export function roleLabel(role: UserRole): string {
  return role === "ADMIN" ? "Admin" : "Nhân viên";
}
