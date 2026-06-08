import Image from "next/image";
import type { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  image: string;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  locale: string;
}

export function ServiceCard({
  icon: Icon,
  image,
  titleVi,
  titleEn,
  descVi,
  descEn,
  locale,
}: ServiceCardProps) {
  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-xl">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={image}
          alt={locale === "vi" ? titleVi : titleEn}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-lg">
          <Icon size={22} aria-hidden="true" />
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-foreground">
          {locale === "vi" ? titleVi : titleEn}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {locale === "vi" ? descVi : descEn}
        </p>
      </div>
    </div>
  );
}
