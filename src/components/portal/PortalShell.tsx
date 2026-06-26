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
  const { user, accessToken, refreshToken, setAuth, setAccessToken, clearAuth } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const ok = await tryRefreshSession(accessToken, refreshToken, setAuth, setAccessToken, clearAuth);
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
