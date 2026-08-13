import { apiFetch } from "./client";

export interface ApiCustomRole {
  id: string;
  name: string;
  description?: string;
  permissionCount?: number;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export function listRoles(): Promise<ApiCustomRole[]> {
  return apiFetch("/roles");
}

export function getRole(id: string): Promise<ApiCustomRole> {
  return apiFetch(`/roles/${id}`);
}

export function createRole(dto: { name: string; description?: string }): Promise<ApiCustomRole> {
  return apiFetch("/roles", { method: "POST", body: JSON.stringify(dto) });
}

export function updateRole(id: string, dto: { name?: string; description?: string }): Promise<ApiCustomRole> {
  return apiFetch(`/roles/${id}`, { method: "PATCH", body: JSON.stringify(dto) });
}

export function deleteRole(id: string): Promise<void> {
  return apiFetch(`/roles/${id}`, { method: "DELETE" });
}

export function getRolePermissions(id: string): Promise<string[]> {
  return apiFetch(`/roles/${id}/permissions`);
}

export function updateRolePermissions(id: string, permissionKeys: string[]): Promise<string[]> {
  return apiFetch(`/roles/${id}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissionKeys }),
  });
}
