"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/lib/auth/authStore";
import { refreshSessionOnce } from "@/lib/auth/useAuth";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface PortalShellProps {
  children: React.ReactNode;
}

export function PortalShell({ children }: PortalShellProps) {
  // Chỉ subscribe `user` để re-render khi đăng nhập/đăng xuất.
  // Token được đọc trực tiếp qua getState() trong effect để tránh dùng
  // giá trị closure cũ (null) khi store chưa rehydrate xong từ localStorage.
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      // Đọc state mới nhất ngay tại thời điểm chạy (sau khi đã rehydrate).
      const { user, accessToken } = useAuthStore.getState();

      // Vừa đăng nhập qua client-side navigation: session đã hợp lệ trong
      // memory → dùng luôn, KHÔNG gọi lại /auth/me. Việc re-validate qua mạng
      // ngay sau đăng nhập từng khiến người dùng bị đá ra login khi /auth/me
      // có lỗi/hang nhất thời, dù token vừa cấp hoàn toàn còn hiệu lực.
      if (user && accessToken) {
        setChecking(false);
        return;
      }

      // Cold load (refresh trang / vào thẳng URL): khôi phục session từ
      // token lưu trong localStorage qua single-flight refresh.
      const ok = await refreshSessionOnce();

      if (cancelled) return;
      if (!ok) {
        router.push(
          `/${locale}/portal/login?redirect=${encodeURIComponent(pathname)}`,
        );
        return;
      }
      setChecking(false);
    }

    // Đảm bảo store đã rehydrate xong từ localStorage trước khi restore.
    if (useAuthStore.persist.hasHydrated()) {
      restoreSession();
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        restoreSession();
      });
      return () => {
        cancelled = true;
        unsub();
      };
    }

    return () => {
      cancelled = true;
    };
    // Chỉ chạy 1 lần khi mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
