"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore, type AuthUser } from "./authStore";
import { hasPermission } from "@/lib/permissions";

// Mock admin user for development
const MOCK_ADMIN: AuthUser = {
  id: "1",
  name: "Admin NUEDU",
  email: "admin@nuedu.vn",
  role: "admin",
  permissions: [
    "posts.create",
    "posts.update.any",
    "posts.delete.any",
    "posts.publish",
    "posts.schedule",
    "categories.manage",
    "tags.manage",
    "chat.read.all",
    "chat.assign",
    "chat.close",
    "media.upload",
    "media.delete",
    "users.manage",
  ],
};

export function useAuth() {
  const { user, accessToken, isLoading, setAuth, clearAuth, setLoading } =
    useAuthStore();
  const router = useRouter();
  const locale = useLocale();

  async function login(email: string, password: string): Promise<boolean> {
    setLoading(true);
    // Mock: any email/password combo works in dev
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    if (email && password) {
      const mockToken = "mock-access-token-" + Date.now();
      setAuth(MOCK_ADMIN, mockToken);
      // Set session cookie so proxy allows portal access
      document.cookie = "nuedu_session=1; path=/; max-age=86400";
      return true;
    }
    setLoading(false);
    return false;
  }

  function logout() {
    clearAuth();
    document.cookie = "nuedu_session=; path=/; max-age=0";
    router.push(`/${locale}/portal/login`);
  }

  function checkPermission(permKey: string): boolean {
    if (!user) return false;
    return hasPermission(user, permKey);
  }

  return {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission: checkPermission,
  };
}
