"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore, type AuthUser } from "./authStore";
import { hasPermission } from "@/lib/permissions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

// 7 ngày — khớp với refresh token TTL
const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

function setSessionCookie() {
  document.cookie = `nuedu_session=1; path=/; max-age=${SESSION_COOKIE_MAX_AGE}`;
}

function clearSessionCookie() {
  document.cookie = "nuedu_session=; path=/; max-age=0";
}

function mapApiUser(apiUser: Record<string, unknown>): AuthUser {
  return {
    id: apiUser.id as string,
    name: apiUser.fullName as string,
    email: apiUser.email as string,
    role: (apiUser.role as string).toLowerCase() as AuthUser["role"],
    permissions: (apiUser.permissions as string[]) ?? [],
  };
}

export async function tryRefreshSession(
  currentToken: string | null,
  setAuth: (user: AuthUser, token: string) => void,
  clearAuth: () => void,
): Promise<boolean> {
  // Thử validate access token hiện tại trước
  if (currentToken) {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
        credentials: "include",
      });
      if (res.ok) {
        const user = await res.json();
        setAuth(mapApiUser(user), currentToken);
        setSessionCookie();
        return true;
      }
    } catch {
      // fall through to refresh
    }
  }

  // Access token hết hạn hoặc không có → dùng refresh token cookie
  try {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include", // gửi cookie nuedu_refresh (httpOnly)
    });

    if (!refreshRes.ok) {
      clearAuth();
      clearSessionCookie();
      return false;
    }

    const { accessToken: newToken } = await refreshRes.json();

    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${newToken}` },
      credentials: "include",
    });

    if (!meRes.ok) {
      clearAuth();
      clearSessionCookie();
      return false;
    }

    const user = await meRes.json();
    setAuth(mapApiUser(user), newToken);
    setSessionCookie();
    return true;
  } catch {
    clearAuth();
    clearSessionCookie();
    return false;
  }
}

export function useAuth() {
  const { user, accessToken, isLoading, setAuth, clearAuth, setLoading } =
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
      setAuth(mapApiUser(data.user), data.accessToken);
      setSessionCookie();
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
    } catch {
      // ignore network errors
    }
    clearAuth();
    clearSessionCookie();
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
