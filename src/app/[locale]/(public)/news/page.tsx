import type { Metadata } from "next";
import { useLocale, useTranslations } from "next-intl";
import { getPublicPosts } from "@/lib/api/public.api";
import { NewsCard } from "@/components/public/NewsCard";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: locale === "vi" ? "Tin tức — NUEDU" : "News — NUEDU",
    description:
      locale === "vi"
        ? "Cập nhật tin tức mới nhất từ NUEDU"
        : "Latest news and updates from NUEDU",
    locale,
    path: "/news",
  });
}

export default async function NewsListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const posts = await getPublicPosts();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="text-4xl font-bold text-foreground mb-12">
          {locale === "vi" ? "Tin tức" : "News"}
        </h1>
        {posts.length === 0 ? (
          <p className="text-muted-foreground">
            {locale === "vi" ? "Chưa có bài viết nào." : "No posts yet."}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <NewsCard
                key={post.id}
                locale={locale}
                post={{
                  slug: post.slug,
                  title: locale === "vi" ? post.titleVi : post.titleEn,
                  excerpt: locale === "vi" ? post.excerptVi : post.excerptEn,
                  featuredImage: post.featuredImage,
                  publishedAt: post.publishedAt,
                  category: post.category,
                  author: post.author,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
