"use client";

import { useAuth } from "@/lib/auth/useAuth";

interface PermissionGateProps {
  children: React.ReactNode;
  need?: string;
  needAny?: string[];
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  need,
  needAny,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, user } = useAuth();

  if (!user) return <>{fallback}</>;

  if (need && !hasPermission(need)) return <>{fallback}</>;
  if (needAny && !needAny.some((p) => hasPermission(p))) return <>{fallback}</>;

  return <>{children}</>;
}
