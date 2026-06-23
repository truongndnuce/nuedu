const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export interface PublicPost {
  id: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  excerptVi?: string;
  excerptEn?: string;
  contentVi?: string;
  contentEn?: string;
  title: string;
  excerpt?: string;
  content?: string;
  publishedAt: string;
  viewCount: number;
  author: { fullName: string; avatarUrl?: string };
  category: { slug: string; nameVi: string; nameEn: string; name: string } | null;
  featuredImage: { cloudinaryUrl: string; width?: number; height?: number } | null;
  tags: { slug: string; nameVi: string; nameEn: string; name: string }[];
  metaTitleVi?: string;
  metaTitleEn?: string;
  metaDescriptionVi?: string;
  metaDescriptionEn?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface PublicPostListResponse {
  items: PublicPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PublicCategory {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  descriptionVi?: string;
  descriptionEn?: string;
  order: number;
  _count: { posts: number };
}

async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getPublicPosts(params?: {
  locale?: string;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}): Promise<PublicPostListResponse> {
  const q = new URLSearchParams();
  if (params?.locale) q.set("locale", params.locale);
  if (params?.category) q.set("category", params.category);
  if (params?.tag) q.set("tag", params.tag);
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  const qs = q.toString();
  return publicFetch(`/public/posts${qs ? `?${qs}` : ""}`);
}

export async function getPublicPostBySlug(
  slug: string,
  locale?: string,
): Promise<PublicPost | null> {
  try {
    const qs = locale ? `?locale=${locale}` : "";
    return await publicFetch<PublicPost>(`/public/posts/${slug}${qs}`);
  } catch {
    return null;
  }
}

export async function getPublicPostsByCategory(
  categorySlug: string,
  locale?: string,
  pagination?: { page?: number; limit?: number },
): Promise<PublicPostListResponse> {
  const q = new URLSearchParams({ category: categorySlug });
  if (locale) q.set("locale", locale);
  if (pagination?.page) q.set("page", String(pagination.page));
  if (pagination?.limit) q.set("limit", String(pagination.limit));
  return publicFetch(`/public/posts?${q}`);
}

export async function getPublicCategories(): Promise<PublicCategory[]> {
  return publicFetch("/public/categories");
}
