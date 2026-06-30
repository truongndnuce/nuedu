"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "author";
  permissions: string[];
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  // true sau khi store đã rehydrate xong từ localStorage. Dùng để chặn
  // thao tác (vd: bấm đăng nhập) trước khi hydrate xong — tránh việc
  // rehydration ghi đè lại state vừa set, khiến đăng nhập "không ăn".
  hasHydrated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      hasHydrated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isLoading: false }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "nuedu-auth",
      // Chỉ persist token, KHÔNG persist `user`. Việc này giúp phân biệt rõ:
      //  - Vừa đăng nhập qua client-side navigation → `user` có trong memory
      //    (chưa bị ghi vào localStorage) → guard tin tưởng luôn, không cần
      //    re-validate qua mạng.
      //  - Cold load (refresh trang / vào URL trực tiếp) → `user` = null →
      //    phải khôi phục qua /auth/me + refresh, đúng như cũ.
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      // Luôn ép `user = null` khi rehydrate (dù localStorage cũ còn lưu user).
      // Nhờ vậy cold load luôn đi qua luồng khôi phục session, và tránh dùng
      // `user` thừa kế từ phiên bản store trước đây (khi user còn được persist).
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AuthState>),
        user: null,
      }),
      onRehydrateStorage: () => (state) => {
        // Gọi sau khi rehydrate hoàn tất (kể cả khi localStorage rỗng)
        state?.setHasHydrated(true);
      },
    },
  ),
);
