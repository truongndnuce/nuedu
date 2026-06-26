"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/news`, label: t("news") },
    { href: `/${locale}/trainers`, label: t("trainers") },
    { href: `/${locale}/about`, label: t("about") },
  ];

  function switchLocale(newLocale: string) {
    // Replace only the locale segment
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.replace(newPath);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="NUEDU"
            width={40}
            height={40}
            priority
            className="h-10 w-10 object-contain"
          />
          <span className="text-xl font-bold text-primary">NUEDU</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: locale switcher + portal */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => switchLocale(locale === "vi" ? "en" : "vi")}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium border border-border hover:bg-muted transition-colors"
          >
            {locale === "vi" ? "EN" : "VI"}
          </button>
          <Link
            href={`/${locale}/portal/dashboard`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t("portal")}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden rounded-md p-2 text-foreground/80 hover:bg-muted"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => switchLocale(locale === "vi" ? "en" : "vi")}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium border border-border hover:bg-muted"
            >
              {locale === "vi" ? "EN" : "VI"}
            </button>
            <Link
              href={`/${locale}/portal/dashboard`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {t("portal")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
