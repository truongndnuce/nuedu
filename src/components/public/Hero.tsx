import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Dumbbell, PlayCircle } from "lucide-react";
import mainBg from "@/app/main-bg.jpg";
import { CountUp } from "@/components/public/CountUp";

export function Hero() {
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <section className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-primary text-primary-foreground">
      <Image
        src={mainBg}
        alt="NUEDU PT academy gym training floor"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.125_0.033_155/0.95)_0%,oklch(0.125_0.033_155/0.82)_30%,oklch(0.125_0.033_155/0.12)_55%,oklch(0.125_0.033_155/0.04)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase text-white backdrop-blur">
            <Dumbbell size={15} aria-hidden="true" />
            {locale === "vi" ? "Học viện đào tạo nghề PT Gym" : "PT Gym career academy"}
          </div>
          <h1
            className="animate-fade-in-up text-4xl font-black uppercase leading-[0.98] text-white sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "0.1s" }}
          >
            {t.rich("heroTitle", { br: () => <br /> })}
          </h1>
          <p
            className="mt-6 max-w-2xl animate-fade-in-up text-lg leading-8 text-white/82 sm:text-xl"
            style={{ animationDelay: "0.2s" }}
          >
            {t("heroSubtitle")}
          </p>
          <div
            className="mt-9 flex animate-fade-in-up flex-wrap items-center gap-4"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href={`/${locale}/contact`}
              className="group inline-flex min-h-12 items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-[0_18px_48px_oklch(0.518_0.114_160.7/0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_56px_oklch(0.518_0.114_160.7/0.4)] hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("heroCtaPrimary")}
              <ArrowRight size={17} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={`/${locale}/about`}
              className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <PlayCircle size={17} aria-hidden="true" />
              {t("heroCtaSecondary")}
            </Link>
          </div>

          <div
            className="mt-10 grid max-w-2xl animate-fade-in-up grid-cols-2 gap-3 text-white sm:gap-4 lg:grid-cols-4"
            style={{ animationDelay: "0.4s" }}
          >
            {[
              { value: 2000, suffix: "+", label: locale === "vi" ? "Học viên đã tốt nghiệp" : "Graduated students" },
              { display: "3 THÁNG", label: locale === "vi" ? "tự tin ra nghề" : "to confidently start a career" },
              { value: 20, label: locale === "vi" ? "Sĩ số tối đa mỗi lớp" : "students max per class" },
              { display: locale === "vi" ? "Toàn quốc" : "Nationwide", label: locale === "vi" ? "Mạng lưới đối tác việc làm" : "Employment partner network" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border-l border-accent/70 pl-3 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="text-2xl font-black sm:text-3xl">
                  {stat.value !== undefined ? (
                    <CountUp value={stat.value} suffix={stat.suffix ?? ""} />
                  ) : (
                    stat.display
                  )}
                </div>
                <div className="mt-1 text-xs font-medium uppercase leading-5 text-white/65">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
