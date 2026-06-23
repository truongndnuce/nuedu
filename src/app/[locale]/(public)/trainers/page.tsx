import { useTranslations, useLocale } from "next-intl";
import { TrainerCard } from "@/components/public/TrainerCard";
import type { ApiTrainer } from "@/lib/api/trainers.api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

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
  const t = useTranslations("trainers");
  const locale = useLocale();
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
