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
    <div className="flex flex-col rounded-xl border border-white/10 bg-primary p-6 text-primary-foreground">
      <div className="text-4xl font-black text-accent">{number}</div>
      <h3 className="mt-3 text-lg font-bold text-white">{isVi ? titleVi : titleEn}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/60">{isVi ? descVi : descEn}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(isVi ? tagsVi : tagsEn).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/75"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 border-t border-white/10 pt-4 text-sm text-white/60">
        {isVi ? "Thời lượng: " : "Duration: "}
        <span className="font-bold text-accent">{isVi ? durationVi : durationEn}</span>
      </div>
    </div>
  );
}
