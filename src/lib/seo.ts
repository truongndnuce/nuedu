import type { Metadata } from "next";
import type { Post } from "@/fixtures/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function buildPostMetadata(
  post: Post,
  locale: string,
  slug: string
): Metadata {
  const isVi = locale === "vi";
  const title = isVi
    ? (post.metaTitleVi ?? post.titleVi)
    : (post.metaTitleEn ?? post.titleEn);
  const description = isVi
    ? (post.metaDescriptionVi ?? post.excerptVi)
    : (post.metaDescriptionEn ?? post.excerptEn);
  const altLocale = isVi ? "en" : "vi";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/news/${slug}`,
      languages: {
        [altLocale]: `${SITE_URL}/${altLocale}/news/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/news/${slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      ...(post.featuredImage && { images: [{ url: post.featuredImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(post.featuredImage && { images: [post.featuredImage] }),
    },
    robots: { index: true, follow: true },
  };
}

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  locale: string;
  path: string;
  altPath?: string;
}): Metadata {
  const { title, description, locale, path, altPath } = opts;
  const altLocale = locale === "vi" ? "en" : "vi";
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}${path}`,
      languages: {
        [altLocale]: `${SITE_URL}/${altLocale}${altPath ?? path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}${path}`,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}
