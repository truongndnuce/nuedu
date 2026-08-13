import type { AuthUser } from "./auth/authStore";

export function hasPermission(user: AuthUser, key: string): boolean {
  if (user.role === "admin") return true;
  return user.permissions.includes(key);
}

export function hasAnyPermission(user: AuthUser, keys: string[]): boolean {
  return keys.some((key) => hasPermission(user, key));
}
