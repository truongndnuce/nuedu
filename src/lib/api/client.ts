"use client";

import { useAuthStore } from "@/lib/auth/authStore";
import { refreshSessionOnce } from "@/lib/auth/useAuth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const buildHeaders = (token: string | null): Record<string, string> => {
    const h: Record<string, string> = {};
    if (init.body && !(init.body instanceof FormData)) {
      h["Content-Type"] = "application/json";
    }
    if (token) h["Authorization"] = `Bearer ${token}`;
    Object.assign(h, init.headers);
    return h;
  };

  const doFetch = (token: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...init,
      headers: buildHeaders(token),
      credentials: "include",
    });

  const { accessToken } = useAuthStore.getState();
  let res = await doFetch(accessToken);

  if (res.status === 401) {
    // Gom mọi 401 song song về một lần refresh duy nhất (tránh đua refresh token).
    const ok = await refreshSessionOnce();
    if (ok) {
      res = await doFetch(useAuthStore.getState().accessToken);
    }
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = Array.isArray(body.message)
        ? body.message[0]
        : (body.message ?? message);
    } catch { /* ignore */ }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
