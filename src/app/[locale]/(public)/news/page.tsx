import type { Metadata } from "next";
import { getPublicPosts } from "@/lib/api/public.api";
import { NewsCard } from "@/components/public/NewsCard";
import { Pagination } from "@/components/public/Pagination";
import { buildPageMetadata } from "@/lib/seo";

const LIMIT = 6;

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
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);

  const { items: posts, totalPages, total } = await getPublicPosts({
    locale,
    page,
    limit: LIMIT,
  });

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 flex items-end justify-between gap-4">
          <h1 className="text-4xl font-bold text-foreground">
            {locale === "vi" ? "Tin tức" : "News"}
          </h1>
          {total > 0 && (
            <p className="text-sm text-muted-foreground">
              {total} {locale === "vi" ? "bài viết" : "posts"}
            </p>
          )}
        </div>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">
            {locale === "vi" ? "Chưa có bài viết nào." : "No posts yet."}
          </p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <NewsCard
                  key={post.id}
                  locale={locale}
                  post={{
                    slug: post.slug,
                    title: post.title,
                    excerpt: post.excerpt ?? "",
                    featuredImage: post.featuredImage?.cloudinaryUrl,
                    publishedAt: post.publishedAt,
                    category: post.category ?? undefined,
                    author: post.author
                      ? { name: post.author.fullName }
                      : undefined,
                  }}
                />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              buildHref={(p) =>
                `/${locale}/news${p === 1 ? "" : `?page=${p}`}`
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
