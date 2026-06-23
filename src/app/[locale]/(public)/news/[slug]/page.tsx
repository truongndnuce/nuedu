import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { vi as viLocale, enUS } from "date-fns/locale";
import { getPublicPostBySlug, getPublicPosts } from "@/lib/api/public.api";
import { buildPostMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPublicPostBySlug(slug, locale);
  if (!post) return { title: "Not found" };
  return buildPostMetadata(post, locale, slug);
}

export async function generateStaticParams() {
  try {
    const { items } = await getPublicPosts({ limit: 100 });
    return items.flatMap((post) => [
      { locale: "vi", slug: post.slug },
      { locale: "en", slug: post.slug },
    ]);
  } catch {
    return [];
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getPublicPostBySlug(slug, locale);
  if (!post) notFound();

  const isVi = locale === "vi";
  const title = isVi ? post.titleVi : post.titleEn;
  const content = isVi ? post.contentVi : post.contentEn;
  const dateLocale = isVi ? viLocale : enUS;
  const formattedDate = format(new Date(post.publishedAt), "d MMMM yyyy", {
    locale: dateLocale,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: post.author.fullName },
    ...(post.featuredImage && { image: post.featuredImage.cloudinaryUrl }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-muted-foreground">
            <Link href={`/${locale}`} className="hover:text-foreground">
              {isVi ? "Trang chủ" : "Home"}
            </Link>
            {" / "}
            <Link href={`/${locale}/news`} className="hover:text-foreground">
              {isVi ? "Tin tức" : "News"}
            </Link>
            {" / "}
            <span className="text-foreground">{title}</span>
          </nav>

          {/* Category */}
          {post.category && (
            <Link
              href={`/${locale}/news/category/${post.category.slug}`}
              className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground mb-4"
            >
              {isVi ? post.category.nameVi : post.category.nameEn}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>

          {/* Meta */}
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{post.author.fullName}</span>
            <span>·</span>
            <time dateTime={post.publishedAt}>{formattedDate}</time>
          </div>

          {/* Featured image */}
          {post.featuredImage && (
            <div className="relative mt-8 h-64 w-full overflow-hidden rounded-xl sm:h-80">
              <Image
                src={post.featuredImage.cloudinaryUrl}
                alt={title ?? ""}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-green mt-10 max-w-none"
            dangerouslySetInnerHTML={{ __html: content ?? "" }}
          />
        </div>
      </article>
    </>
  );
}
