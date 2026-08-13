import type { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactForm } from "@/components/public/ContactForm";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: locale === "vi" ? "Liên hệ" : "Contact",
    description:
      locale === "vi"
        ? "Liên hệ NUEDU để được tư vấn khóa học nghề PT Gym — địa chỉ, hotline, email và bản đồ chỉ đường tại Hà Nội và TP.HCM."
        : "Contact NUEDU for PT Gym course consultation — address, hotline, email, and directions in Hanoi and Ho Chi Minh City.",
    locale,
    path: "/contact",
  });
}

export default function ContactPage() {
  const t = useTranslations("contact");
  const locale = useLocale();

  const infoItems = [
    {
      icon: MapPin,
      label: locale === "vi" ? "Cơ sở Hà Nội" : "Hanoi campus",
      value: "The Vesta, Phú Lãm, Hà Đông, Hà Nội",
    },
    {
      icon: MapPin,
      label: locale === "vi" ? "Cơ sở TP.HCM" : "Ho Chi Minh City campus",
      value: "141 Bắc Hải, Quận 10, TP. Hồ Chí Minh",
    },
    {
      icon: Phone,
      label: locale === "vi" ? "Hotline" : "Hotline",
      value: "0867770689",
      href: "tel:0867770689",
    },
    {
      icon: Mail,
      label: "Email",
      value: "nuedu.vn@gmail.com",
      href: "mailto:nuedu.vn@gmail.com",
    },
    {
      icon: Clock,
      label: locale === "vi" ? "Giờ làm việc" : "Working hours",
      value:
        locale === "vi" ? "Các ngày trong tuần: 6h00 - 21h00" : "Every day: 6:00 AM - 9:00 PM",
    },
  ];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-black uppercase text-accent">{t("title")}</h1>
          <p className="mt-4 text-xl text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left: contact info + map */}
          <div className="space-y-6">
            <div className="space-y-4 rounded-xl border border-border bg-card p-6 sm:p-8">
              {infoItems.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                );
                return item.href ? (
                  <a key={item.label} href={item.href} className="block transition-opacity hover:opacity-80">
                    {content}
                  </a>
                ) : (
                  <div key={item.label}>{content}</div>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                title="NUEDU location map"
                src="https://www.google.com/maps?q=The+Vesta+Ph%C3%BA+L%C3%A3m+H%C3%A0+%C4%90%C3%B4ng+H%C3%A0+N%E1%BB%99i&output=embed"
                width="100%"
                height="320"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right: contact form */}
          <div>
            <ContactForm locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
