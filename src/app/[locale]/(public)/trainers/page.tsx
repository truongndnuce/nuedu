import { useTranslations, useLocale } from "next-intl";
import { TrainerCard } from "@/components/public/TrainerCard";
import { trainers } from "@/content/trainers";

export default function TrainersPage() {
  const t = useTranslations("trainers");
  const locale = useLocale();

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
