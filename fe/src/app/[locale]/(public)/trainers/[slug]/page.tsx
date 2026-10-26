import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getTrainerBySlug } from "@/lib/api/trainers.api";
import { buildPageMetadata } from "@/lib/seo";

// Trainers added after the last build must still render (see news/[slug]).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const trainer = await getTrainerBySlug(slug);
  if (!trainer) return { title: "Not found" };
  return buildPageMetadata({
    title: trainer.headlineVi || trainer.nameVi,
    description: trainer.bioVi,
    locale,
    path: `/trainers/${trainer.slug ?? trainer.id}`,
  });
}

export default async function TrainerDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const trainer = await getTrainerBySlug(slug);
  if (!trainer) notFound();

  const isVi = locale === "vi";
  const name = trainer.nameVi;
  const title = trainer.titleVi;
  const headline = trainer.headlineVi || name;
  const bio = trainer.bioVi;
  const content = trainer.contentVi;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: title,
    image: trainer.avatar,
    ...(trainer.facebookUrl && { sameAs: [trainer.facebookUrl] }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-muted-foreground">
            <Link href={`/${locale}`} className="hover:text-foreground">
              {isVi ? "Trang chủ" : "Home"}
            </Link>
            {" / "}
            <Link href={`/${locale}/trainers`} className="hover:text-foreground">
              {isVi ? "Giảng viên" : "Trainers"}
            </Link>
            {" / "}
            <span className="text-foreground">{name}</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {headline}
          </h1>

          {/* Intro: photo + quote + fanpage */}
          <div className="mt-8 grid gap-6 rounded-lg bg-muted/60 p-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:p-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
              {trainer.avatar && (
                <Image
                  src={trainer.avatar}
                  alt={name}
                  fill
                  sizes="(min-width: 640px) 360px, 100vw"
                  className="object-cover"
                  priority
                />
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xl font-black uppercase text-foreground">{name}</p>
                <p className="mt-1 text-sm font-semibold text-primary">{title}</p>
              </div>
              <p className="whitespace-pre-line text-lg italic leading-relaxed text-foreground/80">
                {bio}
              </p>
              {trainer.facebookUrl && (
                <div>
                  <p className="italic text-primary">
                    {isVi ? "Fanpage chính thức" : "Official fanpage"}
                  </p>
                  <a
                    href={trainer.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block max-w-full break-all border-4 border-double border-primary px-2 py-1 text-sm italic text-primary hover:bg-primary/5"
                  >
                    {trainer.facebookUrl}
                  </a>
                </div>
              )}
              {trainer.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {trainer.specialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {content && (
            <div
              className="tiptap-content mt-10"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </article>
    </>
  );
}
