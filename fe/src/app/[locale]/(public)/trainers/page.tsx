import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { TrainerCard } from "@/components/public/TrainerCard";
import type { ApiTrainer } from "@/lib/api/trainers.api";
import { buildPageMetadata } from "@/lib/seo";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: locale === "vi" ? "Khóa học & giảng viên" : "Courses & trainers",
    description:
      locale === "vi"
        ? "Đội ngũ giảng viên giàu kinh nghiệm trực tiếp giảng dạy tại NUEDU — học viện đào tạo nghề PT Gym."
        : "Meet the experienced instructor team teaching at NUEDU, the PT Gym career academy.",
    locale,
    path: "/trainers",
  });
}

async function fetchTrainers(): Promise<ApiTrainer[]> {
  try {
    const res = await fetch(`${API_BASE}/trainers`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function TrainersPage() {
  const t = await getTranslations("trainers");
  const locale = await getLocale();
  const trainers = await fetchTrainers();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  );
}
