import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostStatus } from '@prisma/client';
import { PrismaService } from '@config/prisma.service';
import { sanitizePostContent } from '@common/utils/html-sanitizer.util';
import { slugify } from '@common/utils/slug.util';
import { AuditService } from '../audit/audit.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import { SchedulePostDto } from './dto/schedule-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const POST_SELECT = {
  id: true,
  slug: true,
  titleVi: true,
  titleEn: true,
  excerptVi: true,
  excerptEn: true,
  contentVi: true,
  contentEn: true,
  status: true,
  scheduledAt: true,
  publishedAt: true,
  viewCount: true,
  metaTitleVi: true,
  metaTitleEn: true,
  metaDescriptionVi: true,
  metaDescriptionEn: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, fullName: true, avatarUrl: true } },
  category: { select: { id: true, slug: true, nameVi: true, nameEn: true } },
  featuredImage: { select: { id: true, cloudinaryId: true, cloudinaryUrl: true, format: true, width: true, height: true } },
  images: {
    orderBy: { order: 'asc' as const },
    select: { media: { select: { id: true, cloudinaryId: true, cloudinaryUrl: true, format: true, width: true, height: true } } },
  },
  tags: { select: { tag: { select: { id: true, slug: true, nameVi: true, nameEn: true } } } },
};

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreatePostDto, authorId: string) {
    const slug = await this.resolveSlug(dto.slug || dto.titleEn || dto.titleVi);

    const post = await this.prisma.post.create({
      data: {
        slug,
        titleVi: dto.titleVi,
        titleEn: dto.titleEn,
        excerptVi: dto.excerptVi,
        excerptEn: dto.excerptEn,
        contentVi: sanitizePostContent(dto.contentVi ?? ''),
        contentEn: sanitizePostContent(dto.contentEn ?? ''),
        categoryId: dto.categoryId,
        featuredImageId: dto.imageIds?.[0],
        authorId,
        metaTitleVi: dto.metaTitleVi,
        metaTitleEn: dto.metaTitleEn,
        metaDescriptionVi: dto.metaDescriptionVi,
        metaDescriptionEn: dto.metaDescriptionEn,
        status: PostStatus.DRAFT,
        ...(dto.tagIds?.length && {
          tags: { create: dto.tagIds.map((tagId) => ({ tagId })) },
        }),
        ...(dto.imageIds?.length && {
          images: { create: dto.imageIds.map((mediaId, order) => ({ mediaId, order })) },
        }),
      },
      select: POST_SELECT,
    });

    return this.flattenTags(post);
  }

  async findAll(dto: ListPostsDto, userId: string, canUpdateAny: boolean) {
    const { page = 1, limit = 20, status, categoryId, authorId, tagId, search } = dto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(tagId && { tags: { some: { tagId } } }),
    };

    // Restrict to own posts unless user has posts.update.any
    if (!canUpdateAny) {
      where.authorId = userId;
    } else if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      where.OR = [
        { titleVi: { contains: search } },
        { titleEn: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.post.findMany({ where, skip, take: limit, orderBy: { updatedAt: 'desc' }, select: POST_SELECT }),
      this.prisma.post.count({ where }),
    ]);

    return {
      items: items.map((p) => this.flattenTags(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string, canUpdateAny: boolean) {
    const post = await this.prisma.post.findFirst({
      where: { id, deletedAt: null },
      select: POST_SELECT,
    });
    if (!post) throw new NotFoundException('Post not found');

    if (!canUpdateAny && (post as any).author?.id !== userId && post.status === PostStatus.DRAFT) {
      throw new ForbiddenException('Access denied');
    }

    return this.flattenTags(post);
  }

  async update(id: string, dto: UpdatePostDto, userId: string, canUpdateAny: boolean) {
    const post = await this.findRaw(id);
    this.checkOwnership(post, userId, canUpdateAny);

    let slug: string | undefined;
    if (dto.slug || dto.titleEn || dto.titleVi) {
      const base = dto.slug || dto.titleEn || dto.titleVi!;
      slug = await this.resolveSlug(base, id);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.tagIds !== undefined) {
        await tx.postTag.deleteMany({ where: { postId: id } });
        if (dto.tagIds.length > 0) {
          await tx.postTag.createMany({ data: dto.tagIds.map((tagId) => ({ postId: id, tagId })) });
        }
      }

      if (dto.imageIds !== undefined) {
        await tx.postImage.deleteMany({ where: { postId: id } });
        if (dto.imageIds.length > 0) {
          await tx.postImage.createMany({
            data: dto.imageIds.map((mediaId, order) => ({ postId: id, mediaId, order })),
          });
        }
      }

      return tx.post.update({
        where: { id },
        data: {
          ...(dto.titleVi && { titleVi: dto.titleVi }),
          ...(dto.titleEn && { titleEn: dto.titleEn }),
          ...(dto.excerptVi !== undefined && { excerptVi: dto.excerptVi }),
          ...(dto.excerptEn !== undefined && { excerptEn: dto.excerptEn }),
          ...(dto.contentVi !== undefined && { contentVi: sanitizePostContent(dto.contentVi) }),
          ...(dto.contentEn !== undefined && { contentEn: sanitizePostContent(dto.contentEn) }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.imageIds !== undefined && { featuredImageId: dto.imageIds[0] ?? null }),
          ...(slug && { slug }),
          ...(dto.metaTitleVi !== undefined && { metaTitleVi: dto.metaTitleVi }),
          ...(dto.metaTitleEn !== undefined && { metaTitleEn: dto.metaTitleEn }),
          ...(dto.metaDescriptionVi !== undefined && { metaDescriptionVi: dto.metaDescriptionVi }),
          ...(dto.metaDescriptionEn !== undefined && { metaDescriptionEn: dto.metaDescriptionEn }),
        },
        select: POST_SELECT,
      });
    });

    return this.flattenTags(updated);
  }

  async softDelete(id: string, userId: string, canDeleteAny: boolean) {
    const post = await this.findRaw(id);
    this.checkOwnership(post, userId, canDeleteAny);
    await this.prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async publish(id: string, userId: string) {
    const post = await this.findRaw(id);
    if (post.status === PostStatus.PUBLISHED) {
      throw new BadRequestException('Post is already published');
    }
    if (!post.titleVi || !post.titleEn || !post.contentVi || !post.contentEn) {
      throw new BadRequestException('Post must have titleVi, titleEn, contentVi, contentEn before publishing');
    }

    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: post.publishedAt ?? new Date(),
        scheduledAt: null,
      },
      select: POST_SELECT,
    });

    void this.audit.log({ userId, action: 'post.publish', entityType: 'Post', entityId: id });
    return updated;
  }

  async unpublish(id: string, userId: string) {
    const post = await this.findRaw(id);
    if (post.status !== PostStatus.PUBLISHED) {
      throw new BadRequestException('Post is not published');
    }
    const updated = await this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.DRAFT },
      select: POST_SELECT,
    });

    void this.audit.log({ userId, action: 'post.unpublish', entityType: 'Post', entityId: id });
    return updated;
  }

  async schedule(id: string, dto: SchedulePostDto) {
    const post = await this.findRaw(id);
    if (post.status === PostStatus.PUBLISHED) {
      throw new BadRequestException('Cannot schedule a published post');
    }
    return this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.SCHEDULED, scheduledAt: dto.scheduledAt },
      select: POST_SELECT,
    });
  }

  async unschedule(id: string) {
    const post = await this.findRaw(id);
    if (post.status !== PostStatus.SCHEDULED) {
      throw new BadRequestException('Post is not scheduled');
    }
    return this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.DRAFT, scheduledAt: null },
      select: POST_SELECT,
    });
  }

  async publishDueScheduled(): Promise<string[]> {
    const duePosts = await this.prisma.post.findMany({
      where: { status: PostStatus.SCHEDULED, scheduledAt: { lte: new Date() } },
      select: { id: true, slug: true },
    });

    if (duePosts.length === 0) return [];

    await this.prisma.post.updateMany({
      where: { id: { in: duePosts.map((p) => p.id) } },
      data: { status: PostStatus.PUBLISHED, publishedAt: new Date() },
    });

    return duePosts.map((p) => p.slug);
  }

  private async findRaw(id: string) {
    const post = await this.prisma.post.findFirst({ where: { id, deletedAt: null } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  private checkOwnership(post: { authorId: string }, userId: string, canAny: boolean) {
    if (!canAny && post.authorId !== userId) {
      throw new ForbiddenException('You can only modify your own posts');
    }
  }

  private async resolveSlug(base: string, excludeId?: string): Promise<string> {
    const baseSlug = slugify(base);
    let slug = baseSlug;
    let counter = 2;

    while (true) {
      const existing = await this.prisma.post.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) break;
      slug = `${baseSlug}-${counter++}`;
    }

    return slug;
  }

  private flattenTags(post: any) {
    return {
      ...post,
      tags: post.tags?.map((pt: any) => pt.tag) ?? [],
      images: post.images?.map((pi: any) => pi.media) ?? [],
    };
  }
}
