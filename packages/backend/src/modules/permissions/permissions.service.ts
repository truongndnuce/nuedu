import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

const SELECT = { id: true, key: true, group: true, description: true };

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.permission.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
      select: SELECT,
    });
  }

  async create(dto: CreatePermissionDto) {
    const existing = await this.prisma.permission.findUnique({ where: { key: dto.key } });
    if (existing) throw new ConflictException('Permission key already exists');

    return this.prisma.permission.create({
      data: { key: dto.key, group: dto.group, description: dto.description },
      select: SELECT,
    });
  }

  async update(id: string, dto: UpdatePermissionDto) {
    const existing = await this.prisma.permission.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Permission not found');

    return this.prisma.permission.update({
      where: { id },
      data: { group: dto.group, description: dto.description },
      select: SELECT,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.permission.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Permission not found');

    // RolePermission/UserPermission reference Permission without onDelete: Cascade,
    // so their rows must be cleared first (mirrors prisma/seed.ts cleanup for deprecated keys).
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { permissionId: id } }),
      this.prisma.userPermission.deleteMany({ where: { permissionId: id } }),
      this.prisma.permission.delete({ where: { id } }),
    ]);
  }

  async getRoleDefaults() {
    const roles = Object.values(UserRole);

    const result: Record<string, string[]> = {};

    await Promise.all(
      roles.map(async (role) => {
        const perms = await this.prisma.rolePermission.findMany({
          where: { role },
          include: { permission: { select: { key: true } } },
        });
        result[role] = perms.map((p) => p.permission.key);
      }),
    );

    return result;
  }
}
