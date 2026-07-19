import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, Dumbbell, PlayCircle } from "lucide-react";
import mainBg from "@/app/main-bg.jpg";

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
      <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.125_0.033_155/0.95)_0%,oklch(0.125_0.033_155/0.76)_42%,oklch(0.125_0.033_155/0.26)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase text-white backdrop-blur">
            <Dumbbell size={15} aria-hidden="true" />
            {locale === "vi" ? "Học viện đào tạo nghề PT Gym" : "PT Gym career academy"}
          </div>
          <h1 className="text-5xl font-black uppercase leading-[0.98] text-white sm:text-7xl lg:text-8xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82 sm:text-xl">
            {t("heroSubtitle")}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href={`/${locale}/contact`}
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-[0_18px_48px_oklch(0.876_0.233_122/0.22)] transition-transform hover:-translate-y-0.5 hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("heroCtaPrimary")}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              href={`/${locale}/about`}
              className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <PlayCircle size={17} aria-hidden="true" />
              {t("heroCtaSecondary")}
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 text-white sm:gap-4 lg:grid-cols-4">
            {[
              ["2000+", locale === "vi" ? "Học viên đã tốt nghiệp" : "Graduated students"],
              ["3 THÁNG", locale === "vi" ? "tự tin ra nghề" : "to confidently start a career"],
              ["20", locale === "vi" ? "Sĩ số tối đa mỗi lớp" : "students max per class"],
              ["Toàn quốc", locale === "vi" ? "Mạng lưới đối tác việc làm" : "Employment partner network"],
            ].map(([value, label]) => (
              <div key={value} className="border-l border-accent/70 pl-3">
                <div className="text-2xl font-black sm:text-3xl">{value}</div>
                <div className="mt-1 text-xs font-medium uppercase leading-5 text-white/65">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-2 gap-4">
          <div className="relative mt-14 aspect-[4/5] overflow-hidden rounded-lg border border-white/12 bg-white/10">
            <Image
              src="/images/gym/gym-training.jpg"
              alt="Coach guiding a gym training session"
              fill
              sizes="(min-width: 1024px) 280px, 0px"
              className="object-cover"
            />
          </div>
          <div className="space-y-4">
            <div className="relative aspect-[5/4] overflow-hidden rounded-lg border border-white/12 bg-white/10">
              <Image
                src="/images/gym/gym-dumbbells.jpg"
                alt="Rows of dumbbells in the NUEDU gym"
                fill
                sizes="(min-width: 1024px) 280px, 0px"
                className="object-cover"
              />
            </div>
            <div className="rounded-lg border border-accent/40 bg-accent p-5 text-accent-foreground">
              <div className="text-4xl font-black leading-none">HIIT</div>
              <div className="mt-2 text-sm font-semibold">
                {locale === "vi" ? "Sức mạnh, cardio, phục hồi" : "Strength, cardio, recovery"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
