import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { MessageCircle, Phone } from "lucide-react";

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.51 3.5 12 3.5 12 3.5s-7.51 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.87.55 9.38.55 9.38.55s7.51 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.6 15.6V8.4l6.27 3.6-6.27 3.6Z" />
    </svg>
  );
}

export function Footer() {
  const t = useTranslations("nav");
  const locale = useLocale();

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Hotline + contact info */}
          <div>
            <a
              href="tel:0867770689"
              className="flex items-center gap-3 rounded-md bg-red-500 px-5 py-4 text-white transition-colors hover:bg-red-600"
            >
              <Phone size={28} />
              <div>
                <p className="text-lg font-bold leading-tight">0867770689</p>
                <p className="text-xs font-medium tracking-wide">HOTLINE</p>
              </div>
            </a>

            <div className="mt-5 space-y-2 text-sm text-primary-foreground/80">
              <p>Email: nuedu.vn@gmail.com</p>
              <p>
                <span className="font-semibold text-primary-foreground">Mã số thuế:</span>{" "}
                0109536261
              </p>
              <p>
                <span className="font-semibold text-primary-foreground">CƠ SỞ HÀ NỘI</span>: The
                Vesta, Phú Lãm, Hà Đông, Hà Nội
              </p>
              <p>
                <span className="font-semibold text-primary-foreground">CƠ SỞ TP.HCM</span>: 141
                Bắc Hải – Quận 10 – TP Hồ Chí Minh
              </p>
            </div>
          </div>

          {/* About links */}
          <div>
            <h3 className="mb-4 text-lg font-bold">
              {locale === "vi" ? "Về chúng tôi" : "About us"}
            </h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li>
                <a
                  href="mailto:nuedu.vn@gmail.com"
                  className="transition-colors hover:text-primary-foreground"
                >
                  {t("contact")}
                </a>
              </li>
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="transition-colors hover:text-primary-foreground"
                >
                  {t("about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-lg font-bold">
              {locale === "vi" ? "Kết nối với chúng tôi" : "Connect with us"}
            </h3>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Messenger"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0084FF] text-white transition-opacity hover:opacity-90"
              >
                <MessageCircle size={20} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2] text-white transition-opacity hover:opacity-90"
              >
                <FacebookIcon />
              </a>
              <a
                href="#"
                aria-label="Zalo"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00C6FF] text-xs font-bold text-white transition-opacity hover:opacity-90"
              >
                Zalo
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF0000] text-white transition-opacity hover:opacity-90"
              >
                <YoutubeIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} NUEDU. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
