import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@config/prisma.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';

@Injectable()
export class TrainersService {
  constructor(private readonly prisma: PrismaService) {}

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

  create(dto: CreateTrainerDto) {
    return this.prisma.trainer.create({
      data: {
        nameVi: dto.nameVi,
        nameEn: dto.nameEn,
        titleVi: dto.titleVi,
        titleEn: dto.titleEn,
        bioVi: dto.bioVi,
        bioEn: dto.bioEn,
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
        ...(dto.nameVi !== undefined && { nameVi: dto.nameVi }),
        ...(dto.nameEn !== undefined && { nameEn: dto.nameEn }),
        ...(dto.titleVi !== undefined && { titleVi: dto.titleVi }),
        ...(dto.titleEn !== undefined && { titleEn: dto.titleEn }),
        ...(dto.bioVi !== undefined && { bioVi: dto.bioVi }),
        ...(dto.bioEn !== undefined && { bioEn: dto.bioEn }),
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
}
