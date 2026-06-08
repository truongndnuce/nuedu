"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/lib/auth/authStore";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface PortalShellProps {
  children: React.ReactNode;
}

export function PortalShell({ children }: PortalShellProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  useEffect(() => {
    // If no user in memory store, redirect to login
    // (cookie-based guard in proxy handles initial navigation)
    if (!user) {
      router.push(`/${locale}/portal/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, locale, pathname, router]);

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
