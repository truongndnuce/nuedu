// RSC data fetcher — reads from fixtures for now; swap to fetch(BE) later
import {
  getAllPosts,
  getPostBySlug,
  getPostsByCategory,
  type Post,
} from "@/fixtures/posts";

export async function getPublicPosts(): Promise<Post[]> {
  return getAllPosts();
}

export async function getPublicPostBySlug(
  slug: string,
  _locale: string
): Promise<Post | null> {
  return getPostBySlug(slug) ?? null;
}

export async function getPublicPostsByCategory(
  categorySlug: string
): Promise<Post[]> {
  return getPostsByCategory(categorySlug);
}
