import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@config/prisma.service';
import { slugify } from '@common/utils/slug.util';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string) {
    return this.prisma.tag.findMany({
      where: search
        ? {
            OR: [
              { nameVi: { contains: search } },
              { nameEn: { contains: search } },
              { slug: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { nameEn: 'asc' },
    });
  }

  async create(dto: CreateTagDto) {
    const slug = await this.resolveSlug(dto.slug || dto.nameEn || dto.nameVi);
    return this.prisma.tag.create({
      data: { slug, nameVi: dto.nameVi, nameEn: dto.nameEn },
    });
  }

  async update(id: string, dto: UpdateTagDto) {
    await this.findOne(id);
    let slug: string | undefined;
    if (dto.slug || dto.nameEn || dto.nameVi) {
      slug = await this.resolveSlug(dto.slug || dto.nameEn || dto.nameVi!, id);
    }
    return this.prisma.tag.update({
      where: { id },
      data: {
        ...(dto.nameVi && { nameVi: dto.nameVi }),
        ...(dto.nameEn && { nameEn: dto.nameEn }),
        ...(slug && { slug }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.postTag.deleteMany({ where: { tagId: id } });
    await this.prisma.tag.delete({ where: { id } });
  }

  private async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  private async resolveSlug(base: string, excludeId?: string): Promise<string> {
    const baseSlug = slugify(base);
    let slug = baseSlug;
    let counter = 2;

    while (true) {
      const existing = await this.prisma.tag.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) break;
      slug = `${baseSlug}-${counter++}`;
    }

    return slug;
  }
}
