"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore, type AuthUser } from "./authStore";
import { hasPermission } from "@/lib/permissions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

function mapApiUser(apiUser: Record<string, unknown>): AuthUser {
  return {
    id: apiUser.id as string,
    name: apiUser.fullName as string,
    email: apiUser.email as string,
    role: (apiUser.role as string).toLowerCase() as AuthUser["role"],
    permissions: (apiUser.permissions as string[]) ?? [],
  };
}

/**
 * Kiểm tra access token hiện tại còn hợp lệ không.
 * Nếu hết hạn → dùng refreshToken (localStorage) để lấy access token mới.
 * Trả về true nếu session được khôi phục thành công.
 */
export async function tryRefreshSession(
  currentAccessToken: string | null,
  currentRefreshToken: string | null,
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void,
  setAccessToken: (accessToken: string) => void,
  clearAuth: () => void,
): Promise<boolean> {
  // Thử validate access token hiện tại
  if (currentAccessToken) {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${currentAccessToken}` },
        credentials: "include",
      });
      if (res.ok) {
        const user = await res.json();
        // User vẫn hợp lệ — cập nhật user data nhưng giữ nguyên tokens
        const { refreshToken } = useAuthStore.getState();
        setAuth(mapApiUser(user), currentAccessToken, refreshToken ?? "");
        return true;
      }
    } catch {
      // fall through to refresh
    }
  }

  // Access token hết hạn hoặc không có → dùng refresh token từ localStorage
  if (!currentRefreshToken) {
    clearAuth();
    return false;
  }

  try {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!refreshRes.ok) {
      clearAuth();
      return false;
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await refreshRes.json();

    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${newAccessToken}` },
      credentials: "include",
    });

    if (!meRes.ok) {
      clearAuth();
      return false;
    }

    const user = await meRes.json();
    setAuth(mapApiUser(user), newAccessToken, newRefreshToken);
    return true;
  } catch {
    clearAuth();
    return false;
  }
}

export function useAuth() {
  const { user, accessToken, refreshToken, isLoading, setAuth, setAccessToken, clearAuth, setLoading } =
    useAuthStore();
  const router = useRouter();
  const locale = useLocale();

  async function login(email: string, password: string): Promise<boolean> {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setLoading(false);
        return false;
      }

      const data = await res.json();
      setAuth(mapApiUser(data.user), data.accessToken, data.refreshToken);
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  }

  async function register(
    fullName: string,
    email: string,
    password: string,
  ): Promise<{ ok: boolean; error?: string }> {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!res.ok) {
        setLoading(false);
        const data = await res.json().catch(() => null);
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : (data?.message as string | undefined);
        return { ok: false, error: message };
      }

      const data = await res.json();
      setAuth(mapApiUser(data.user), data.accessToken, data.refreshToken);
      return { ok: true };
    } catch {
      setLoading(false);
      return { ok: false };
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // ignore network errors
    }
    clearAuth();
    router.push(`/${locale}/portal/login`);
  }

  function checkPermission(permKey: string): boolean {
    if (!user) return false;
    return hasPermission(user, permKey);
  }

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    hasPermission: checkPermission,
  };
}
