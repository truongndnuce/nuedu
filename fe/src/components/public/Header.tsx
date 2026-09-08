"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { getPublicCategories, type PublicCategory } from "@/lib/api/public.api";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<PublicCategory[]>([]);

  useEffect(() => {
    getPublicCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const navLinks = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/news`, label: t("news"), dropdown: true },
    { href: `/${locale}/trainers`, label: t("trainers") },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/contact`, label: t("contact"), emphasis: true },
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
          {navLinks.map((link) =>
            link.dropdown && categories.length > 0 ? (
              <div key={link.href} className="group relative">
                <Link
                  href={link.href}
                  className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                  <ChevronDown size={14} />
                </Link>
                <div className="invisible absolute left-0 top-full z-50 min-w-[220px] rounded-md border border-border bg-background py-1 opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/${locale}/news/category/${category.slug}`}
                      className="block px-4 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-foreground"
                    >
                      {locale === "vi" ? category.nameVi : category.nameEn}
                    </Link>
                  ))}
                  <div className="my-1 border-t border-border" />
                  <Link
                    href={link.href}
                    className="block px-4 py-2 text-sm font-bold uppercase text-primary hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.emphasis
                    ? "rounded-md px-3 py-2 text-sm font-bold uppercase text-accent hover:text-accent/80 transition-colors"
                    : "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
                }
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Right side: locale switcher */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => switchLocale(locale === "vi" ? "en" : "vi")}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium border border-border hover:bg-muted transition-colors"
          >
            {locale === "vi" ? "EN" : "VI"}
          </button>
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
            <div key={link.href}>
              <Link
                href={link.href}
                className={
                  link.emphasis
                    ? "block rounded-md px-3 py-2 text-sm font-bold uppercase text-accent"
                    : "block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted"
                }
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
              {link.dropdown && categories.length > 0 && (
                <div className="ml-3 space-y-1 border-l border-border pl-3">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/${locale}/news/category/${category.slug}`}
                      className="block rounded-md px-3 py-1.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted"
                      onClick={() => setMobileOpen(false)}
                    >
                      {locale === "vi" ? category.nameVi : category.nameEn}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => switchLocale(locale === "vi" ? "en" : "vi")}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium border border-border hover:bg-muted"
            >
              {locale === "vi" ? "EN" : "VI"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
