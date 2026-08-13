import { Injectable, NotFoundException } from '@nestjs/common';
import { PostStatus } from '@prisma/client';
import { PrismaService } from '@config/prisma.service';

const PUBLIC_POST_SELECT = {
  id: true,
  slug: true,
  titleVi: true,
  titleEn: true,
  excerptVi: true,
  excerptEn: true,
  contentVi: true,
  contentEn: true,
  publishedAt: true,
  viewCount: true,
  metaTitleVi: true,
  metaTitleEn: true,
  metaDescriptionVi: true,
  metaDescriptionEn: true,
  author: { select: { fullName: true, avatarUrl: true } },
  category: { select: { slug: true, nameVi: true, nameEn: true } },
  featuredImage: { select: { cloudinaryId: true, cloudinaryUrl: true, width: true, height: true, format: true } },
  tags: { select: { tag: { select: { slug: true, nameVi: true, nameEn: true } } } },
};

// Simple in-memory view dedup: ip:postId → expiry timestamp (resets on server restart)
const viewedSet = new Map<string, number>();

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async listPosts(query: {
    locale?: string;
    category?: string;
    tag?: string;
    page?: number;
    limit?: number;
  }) {
    const { locale, category, tag, page = 1, limit = 12 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      status: PostStatus.PUBLISHED,
      publishedAt: { lte: new Date() },
      deletedAt: null,
      ...(category && { category: { slug: category } }),
      ...(tag && { tags: { some: { tag: { slug: tag } } } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: PUBLIC_POST_SELECT,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      items: items.map((p) => this.localizePost(p, locale)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPost(slug: string, locale?: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, status: PostStatus.PUBLISHED, publishedAt: { lte: new Date() }, deletedAt: null },
      select: PUBLIC_POST_SELECT,
    });

    if (!post) throw new NotFoundException('Post not found');
    return this.localizePost(post, locale);
  }

  async getLatestPosts(limit = 5) {
    const posts = await this.prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED, publishedAt: { lte: new Date() }, deletedAt: null },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      select: PUBLIC_POST_SELECT,
    });
    return posts.map((p) => this.localizePost(p));
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        nameVi: true,
        nameEn: true,
        descriptionVi: true,
        descriptionEn: true,
        order: true,
        _count: { select: { posts: { where: { status: PostStatus.PUBLISHED, deletedAt: null } } } },
      },
    });
  }

  async getSitemapData() {
    const posts = await this.prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED, deletedAt: null },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    return posts.map((p) => ({
      slug: p.slug,
      lastModified: p.updatedAt.toISOString(),
      urls: [`/vi/news/${p.slug}`, `/en/news/${p.slug}`],
    }));
  }

  async incrementViewCount(slug: string, ip: string): Promise<void> {
    const post = await this.prisma.post.findFirst({
      where: { slug, status: PostStatus.PUBLISHED, deletedAt: null },
      select: { id: true },
    });
    if (!post) return;

    const key = `${ip}:${post.id}`;
    const now = Date.now();
    const expiry = viewedSet.get(key);
    if (expiry && expiry > now) return;

    viewedSet.set(key, now + 3_600_000);
    await this.prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
  }

  private localizePost(post: any, locale?: string) {
    const isEn = locale === 'en';
    return {
      ...post,
      title: isEn ? post.titleEn : post.titleVi,
      excerpt: isEn ? post.excerptEn : post.excerptVi,
      content: isEn ? post.contentEn : post.contentVi,
      metaTitle: isEn ? post.metaTitleEn : post.metaTitleVi,
      metaDescription: isEn ? post.metaDescriptionEn : post.metaDescriptionVi,
      category: post.category
        ? { ...post.category, name: isEn ? post.category.nameEn : post.category.nameVi }
        : null,
      tags: post.tags?.map((pt: any) => ({
        ...pt.tag,
        name: isEn ? pt.tag.nameEn : pt.tag.nameVi,
      })) ?? [],
    };
  }
}
