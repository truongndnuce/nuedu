import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface PostForMeta {
  titleVi: string;
  titleEn?: string;
  excerptVi?: string;
  excerptEn?: string;
  metaTitleVi?: string;
  metaTitleEn?: string;
  metaDescriptionVi?: string;
  metaDescriptionEn?: string;
  publishedAt: string;
  featuredImage?: string | { cloudinaryUrl: string } | null;
}

export function buildPostMetadata(
  post: PostForMeta,
  locale: string,
  slug: string,
): Metadata {
  const isVi = locale === "vi";
  const title = isVi
    ? (post.metaTitleVi ?? post.titleVi)
    : (post.metaTitleEn ?? post.titleEn);
  const description = isVi
    ? (post.metaDescriptionVi ?? post.excerptVi)
    : (post.metaDescriptionEn ?? post.excerptEn);
  const altLocale = isVi ? "en" : "vi";

  const imageUrl =
    !post.featuredImage
      ? undefined
      : typeof post.featuredImage === "string"
        ? post.featuredImage
        : post.featuredImage.cloudinaryUrl;

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
      ...(imageUrl && { images: [{ url: imageUrl }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
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
