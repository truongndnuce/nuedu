import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@config/prisma.service';
import { slugify } from '@common/utils/slug.util';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({ orderBy: { order: 'asc' } });
  }

  async create(dto: CreateCategoryDto) {
    const slug = await this.resolveSlug(dto.slug || dto.nameEn || dto.nameVi);
    return this.prisma.category.create({
      data: {
        slug,
        nameVi: dto.nameVi,
        nameEn: dto.nameEn,
        descriptionVi: dto.descriptionVi,
        descriptionEn: dto.descriptionEn,
        order: dto.order ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    let slug: string | undefined;
    if (dto.slug || dto.nameEn || dto.nameVi) {
      const base = dto.slug || dto.nameEn || dto.nameVi!;
      slug = await this.resolveSlug(base, id);
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.nameVi && { nameVi: dto.nameVi }),
        ...(dto.nameEn && { nameEn: dto.nameEn }),
        ...(dto.descriptionVi !== undefined && { descriptionVi: dto.descriptionVi }),
        ...(dto.descriptionEn !== undefined && { descriptionEn: dto.descriptionEn }),
        ...(slug && { slug }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    const usedByPosts = await this.prisma.post.count({ where: { categoryId: id } });

    if (usedByPosts > 0) {
      throw new BadRequestException(
        `Cannot delete category: ${usedByPosts} post(s) are using it`,
      );
    }

    await this.prisma.category.delete({ where: { id: category.id } });
  }

  private async findOne(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  private async resolveSlug(base: string, excludeId?: string): Promise<string> {
    const baseSlug = slugify(base);
    let slug = baseSlug;
    let counter = 2;

    while (true) {
      const existing = await this.prisma.category.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) break;
      slug = `${baseSlug}-${counter++}`;
    }

    return slug;
  }
}
