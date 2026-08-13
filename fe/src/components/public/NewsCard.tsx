import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";

export interface NewsCardPost {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage?: string;
  publishedAt: string;
  category?: { nameVi: string; nameEn: string; slug: string };
  author?: { name: string };
}

interface NewsCardProps {
  post: NewsCardPost;
  locale: string;
}

export function NewsCard({ post, locale }: NewsCardProps) {
  const dateLocale = locale === "vi" ? vi : enUS;
  const formattedDate = format(new Date(post.publishedAt), "d MMM yyyy", {
    locale: dateLocale,
  });

  return (
    <Link
      href={`/${locale}/news/${post.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Thumbnail */}
      <div className="relative h-44 w-full bg-muted">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover transition-transform group-hover:scale-105 duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <span className="text-3xl text-muted-foreground/30">📰</span>
          </div>
        )}
        {post.category && (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
            {locale === "vi" ? post.category.nameVi : post.category.nameEn}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{post.author?.name ?? "NUEDU"}</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </Link>
  );
}
