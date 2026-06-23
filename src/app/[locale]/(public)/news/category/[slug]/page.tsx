import { notFound } from "next/navigation";
import { getPublicPostsByCategory, getPublicCategories } from "@/lib/api/public.api";
import { NewsCard } from "@/components/public/NewsCard";
import { Pagination } from "@/components/public/Pagination";

const LIMIT = 6;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);

  const [categories, { items: posts, totalPages, total }] = await Promise.all([
    getPublicCategories(),
    getPublicPostsByCategory(slug, locale, { page, limit: LIMIT }),
  ]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const categoryName = locale === "vi" ? category.nameVi : category.nameEn;

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground">{categoryName}</h1>
          </div>
          {total > 0 && (
            <p className="text-sm text-muted-foreground">
              {total} {locale === "vi" ? "bài viết" : "posts"}
            </p>
          )}
        </div>

        {posts.length === 0 ? (
          <p className="text-center py-16 text-muted-foreground">
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
                `/${locale}/news/category/${slug}${p === 1 ? "" : `?page=${p}`}`
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
