"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Image,
  Tag,
  FolderOpen,
  Users,
  ShieldCheck,
  Settings,
  UserCheck,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PermissionGate } from "./PermissionGate";

export function Sidebar() {
  const locale = useLocale();
  const pathname = usePathname();

  const nav: {
    href: string;
    icon: React.ElementType;
    label: string;
    need?: string;
    needAny?: string[];
  }[] = [
    {
      href: `/${locale}/portal/dashboard`,
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      href: `/${locale}/portal/posts`,
      icon: FileText,
      label: "Bài viết",
      needAny: [
        "posts.create",
        "posts.update.own",
        "posts.update.any",
        "posts.delete.own",
        "posts.delete.any",
        "posts.publish",
        "posts.schedule",
      ],
    },
    {
      href: `/${locale}/portal/categories`,
      icon: FolderOpen,
      label: "Danh mục",
      need: "categories.manage",
    },
    {
      href: `/${locale}/portal/tags`,
      icon: Tag,
      label: "Thẻ",
      need: "tags.manage",
    },
    {
      href: `/${locale}/portal/chat`,
      icon: MessageSquare,
      label: "Chat inbox",
      needAny: ["chat.read.all", "chat.read.assigned"],
    },
    {
      href: `/${locale}/portal/media`,
      icon: Image,
      label: "Thư viện ảnh",
      needAny: ["media.upload", "media.delete.own", "media.delete.any"],
    },
  ];

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
        <NextImage
          src="/images/logo.png"
          alt="NUEDU"
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
        <span className="text-lg font-bold text-sidebar-primary">NUEDU</span>
        <span className="text-xs text-sidebar-foreground/50">Portal</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {nav.map(({ href, icon: Icon, label, need, needAny }) => {
          const link = (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
          if (need || needAny) {
            return (
              <PermissionGate key={href} need={need} needAny={needAny}>
                {link}
              </PermissionGate>
            );
          }
          return link;
        })}

        {/* Permission-gated: Testimonials */}
        <PermissionGate need="testimonials.manage">
          <Link
            href={`/${locale}/portal/testimonials`}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(`/${locale}/portal/testimonials`)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            <MessageCircle size={16} />
            Feedback
          </Link>
        </PermissionGate>

        {/* Permission-gated: Trainers */}
        <PermissionGate need="trainers.manage">
          <Link
            href={`/${locale}/portal/trainers`}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(`/${locale}/portal/trainers`)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            <UserCheck size={16} />
            Giảng viên
          </Link>
        </PermissionGate>

        {/* Admin-only: Users */}
        <PermissionGate need="users.read">
          <Link
            href={`/${locale}/portal/users`}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(`/${locale}/portal/users`)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            <Users size={16} />
            Người dùng
          </Link>
        </PermissionGate>

        {/* Admin-only: Roles */}
        <PermissionGate need="roles.manage">
          <Link
            href={`/${locale}/portal/roles`}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(`/${locale}/portal/roles`)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            <ShieldCheck size={16} />
            Vai trò
          </Link>
        </PermissionGate>

        {/* Admin-only: System Settings */}
        <PermissionGate need="settings.manage">
          <Link
            href={`/${locale}/portal/settings`}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(`/${locale}/portal/settings`)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            <Settings size={16} />
            Cài đặt hệ thống
          </Link>
        </PermissionGate>

        {/* Always visible: Account settings */}
        <div className="mt-2 border-t border-sidebar-border pt-2">
          <Link
            href={`/${locale}/portal/account`}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(`/${locale}/portal/account`)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            <Settings size={16} />
            Cài đặt tài khoản
          </Link>
        </div>
      </nav>
    </aside>
  );
}
