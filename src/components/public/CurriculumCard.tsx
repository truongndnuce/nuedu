interface CurriculumCardProps {
  number: string;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  tagsVi: string[];
  tagsEn: string[];
  durationVi: string;
  durationEn: string;
  locale: string;
}

export function CurriculumCard({
  number,
  titleVi,
  titleEn,
  descVi,
  descEn,
  tagsVi,
  tagsEn,
  durationVi,
  durationEn,
  locale,
}: CurriculumCardProps) {
  const isVi = locale === "vi";

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-lg font-black text-accent-foreground">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">{isVi ? titleVi : titleEn}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{isVi ? descVi : descEn}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(isVi ? tagsVi : tagsEn).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
        {isVi ? "Thời lượng: " : "Duration: "}
        <span className="font-bold text-accent">{isVi ? durationVi : durationEn}</span>
      </div>
    </div>
  );
}
