import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

export function Footer() {
  const t = useTranslations("nav");
  const locale = useLocale();

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="NUEDU"
                width={40}
                height={40}
                className="h-10 w-10 object-contain bg-white rounded-md p-0.5"
              />
              <span className="text-xl font-bold">NUEDU</span>
            </div>
            <p className="mt-3 text-sm text-primary-foreground/70 leading-relaxed">
              {locale === "vi"
                ? "Trung tâm đào tạo thể lực và sức khỏe chuyên nghiệp."
                : "Professional fitness and health training center."}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">
              {locale === "vi" ? "Trang" : "Pages"}
            </h3>
            <ul className="space-y-2">
              {[
                { href: `/${locale}`, label: t("home") },
                { href: `/${locale}/news`, label: t("news") },
                { href: `/${locale}/trainers`, label: t("trainers") },
                { href: `/${locale}/about`, label: t("about") },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-4">
              {locale === "vi" ? "Liên hệ" : "Contact"}
            </h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>📍 Hà Nội, Việt Nam</li>
              <li>📞 0123 456 789</li>
              <li>✉️ info@nuedu.vn</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} NUEDU. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
