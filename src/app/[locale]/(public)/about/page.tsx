import { useTranslations, useLocale } from "next-intl";
import { aboutContent } from "@/content/about";

export default function AboutPage() {
  const t = useTranslations("about");
  const locale = useLocale() as "vi" | "en";
  const content = aboutContent[locale];

  const stats = [
    { label: locale === "vi" ? "Thành lập" : "Founded", value: content.founded },
    { label: locale === "vi" ? "Học viên" : "Students", value: content.students },
    { label: locale === "vi" ? "Giáo viên" : "Trainers", value: content.trainers },
    { label: locale === "vi" ? "Chương trình" : "Programs", value: content.programs },
  ];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-4 text-xl text-muted-foreground">{content.subtitle}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 mb-16">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-primary p-6 text-center text-primary-foreground"
            >
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="mt-1 text-sm text-primary-foreground/70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {t("mission")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {content.mission}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {t("vision")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {content.vision}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
