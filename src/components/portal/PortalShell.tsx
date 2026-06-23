"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/lib/auth/authStore";
import { tryRefreshSession } from "@/lib/auth/useAuth";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface PortalShellProps {
  children: React.ReactNode;
}

export function PortalShell({ children }: PortalShellProps) {
  const { user, accessToken, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      // Nếu đã có user trong store (từ localStorage persist) → validate nhanh
      // Nếu không → thử refresh token
      const ok = await tryRefreshSession(accessToken, setAuth, clearAuth);
      if (!ok) {
        router.push(`/${locale}/portal/login?redirect=${encodeURIComponent(pathname)}`);
      }
      setChecking(false);
    }

    restoreSession();
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
