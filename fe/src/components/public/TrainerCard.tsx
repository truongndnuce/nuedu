import Image from "next/image";
import Link from "next/link";
import { trainerPath, type ApiTrainer } from "@/lib/api/trainers.api";

interface TrainerCardProps {
  trainer: ApiTrainer;
  locale: string;
}

export function TrainerCard({ trainer, locale }: TrainerCardProps) {
  const name = trainer.nameVi;
  const title = trainer.titleVi;
  const bio = trainer.bioVi;

  return (
    <Link
      href={trainerPath(locale, trainer)}
      className="group block overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-xl"
    >
      <div className="relative aspect-square w-full bg-muted">
        {trainer.avatar && (
          <Image
            src={trainer.avatar}
            alt={name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-5">
        <div className="text-center">
          <h3 className="text-2xl font-black uppercase text-foreground transition-colors group-hover:text-primary">
            {name}
          </h3>
          <p className="mt-1 text-sm font-semibold text-primary">{title}</p>
        </div>
        <p className="mt-4 text-sm italic text-muted-foreground line-clamp-3">{bio}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {trainer.specialties.map((s) => (
            <span
              key={s}
              className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
