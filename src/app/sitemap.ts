import type { MetadataRoute } from "next";
import { routing } from "@/lib/i18n/routing";
import { getPublicPosts } from "@/lib/api/public.api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const staticPaths = ["", "/news", "/trainers", "/about", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
      });
    }
  }

  try {
    const { items } = await getPublicPosts({ limit: 200 });
    for (const locale of routing.locales) {
      for (const post of items) {
        entries.push({
          url: `${SITE_URL}/${locale}/news/${post.slug}`,
          lastModified: new Date(post.publishedAt),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  } catch {
    // API unavailable at build time — static routes are still returned
  }

  return entries;
}
