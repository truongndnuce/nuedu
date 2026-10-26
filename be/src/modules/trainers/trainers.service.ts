import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@config/prisma.service';
import { slugify } from '@common/utils/slug.util';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';

@Injectable()
export class TrainersService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  // Trainers created before slugs existed get one derived from their name.
  async onModuleInit() {
    const missing = await this.prisma.trainer.findMany({
      where: { slug: null },
      select: { id: true, nameVi: true },
    });
    for (const trainer of missing) {
      const slug = await this.resolveSlug(trainer.nameVi, trainer.id);
      await this.prisma.trainer.update({ where: { id: trainer.id }, data: { slug } });
    }
  }

  findAll() {
    return this.prisma.trainer.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  findAllAdmin() {
    return this.prisma.trainer.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const trainer = await this.prisma.trainer.findFirst({
      where: { isActive: true, OR: [{ slug }, { id: slug }] },
    });
    if (!trainer) throw new NotFoundException('Trainer not found');
    return trainer;
  }

  async create(dto: CreateTrainerDto) {
    return this.prisma.trainer.create({
      data: {
        slug: await this.resolveSlug(dto.slug || dto.nameVi),
        headlineVi: dto.headlineVi || null,
        contentVi: dto.contentVi || null,
        facebookUrl: dto.facebookUrl || null,
        nameVi: dto.nameVi,
        nameEn: '',
        titleVi: dto.titleVi,
        titleEn: '',
        bioVi: dto.bioVi,
        bioEn: '',
        avatar: dto.avatar,
        specialties: dto.specialties,
        order: dto.order ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateTrainerDto) {
    await this.findOne(id);
    return this.prisma.trainer.update({
      where: { id },
      data: {
        ...(dto.slug && { slug: await this.resolveSlug(dto.slug, id) }),
        ...(dto.headlineVi !== undefined && { headlineVi: dto.headlineVi || null }),
        ...(dto.contentVi !== undefined && { contentVi: dto.contentVi || null }),
        ...(dto.facebookUrl !== undefined && { facebookUrl: dto.facebookUrl || null }),
        ...(dto.nameVi !== undefined && { nameVi: dto.nameVi }),
        ...(dto.titleVi !== undefined && { titleVi: dto.titleVi }),
        ...(dto.bioVi !== undefined && { bioVi: dto.bioVi }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
        ...(dto.specialties !== undefined && { specialties: dto.specialties }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.trainer.delete({ where: { id } });
  }

  private async findOne(id: string) {
    const trainer = await this.prisma.trainer.findUnique({ where: { id } });
    if (!trainer) throw new NotFoundException('Trainer not found');
    return trainer;
  }

  private async resolveSlug(base: string, excludeId?: string): Promise<string> {
    const baseSlug = slugify(base) || 'giang-vien';
    let slug = baseSlug;
    let counter = 2;

    while (true) {
      const existing = await this.prisma.trainer.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) break;
      slug = `${baseSlug}-${counter++}`;
    }

    return slug;
  }
}
