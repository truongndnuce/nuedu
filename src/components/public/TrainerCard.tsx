import Image from "next/image";
import type { Trainer } from "@/content/trainers";

interface TrainerCardProps {
  trainer: Trainer;
  locale: string;
}

export function TrainerCard({ trainer, locale }: TrainerCardProps) {
  const name = locale === "vi" ? trainer.nameVi : trainer.nameEn;
  const title = locale === "vi" ? trainer.titleVi : trainer.titleEn;
  const bio = locale === "vi" ? trainer.bioVi : trainer.bioEn;

  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-xl">
      <div className="relative aspect-[4/3] w-full bg-muted">
        <Image
          src={trainer.avatar}
          alt={name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-black/8 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-black text-white">{name}</h3>
          <p className="mt-1 text-sm font-semibold text-accent">{title}</p>
        </div>
      </div>
      <div className="p-5">
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{bio}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {trainer.specialties.map((s) => (
            <span
              key={s}
              className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
