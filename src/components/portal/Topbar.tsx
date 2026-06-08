"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { LogOut, User } from "lucide-react";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div /> {/* Spacer for future breadcrumbs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User size={15} />
          <span>{user?.name}</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
            {user?.role}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut size={14} />
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
