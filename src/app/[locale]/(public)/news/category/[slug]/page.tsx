import { getPublicPostsByCategory } from "@/lib/api/public.api";
import { categories } from "@/fixtures/posts";
import { NewsCard } from "@/components/public/NewsCard";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const posts = await getPublicPostsByCategory(slug);
  const categoryName = locale === "vi" ? category.nameVi : category.nameEn;

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="text-4xl font-bold text-foreground mb-3">
          {categoryName}
        </h1>
        <p className="text-muted-foreground mb-12">
          {posts.length} {locale === "vi" ? "bài viết" : "posts"}
        </p>
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
      </div>
    </div>
  );
}
