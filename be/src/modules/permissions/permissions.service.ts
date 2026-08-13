import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { UpdateRoleDefaultsDto } from './dto/update-role-defaults.dto';

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

    // Newly created permissions are granted to ADMIN by default, since ADMIN
    // is meant to always have every permission unless explicitly narrowed.
    return this.prisma.$transaction(async (tx) => {
      const perm = await tx.permission.create({
        data: { key: dto.key, group: dto.group, description: dto.description },
        select: SELECT,
      });
      await tx.rolePermission.create({
        data: { role: UserRole.ADMIN, permissionId: perm.id },
      });
      return perm;
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

  async updateRoleDefaults(role: string, dto: UpdateRoleDefaultsDto) {
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new BadRequestException(`Unknown role: ${role}`);
    }
    const targetRole = role as UserRole;

    const perms = await this.prisma.permission.findMany({
      where: { key: { in: dto.permissionKeys } },
    });

    if (perms.length !== dto.permissionKeys.length) {
      const found = new Set(perms.map((p) => p.key));
      const missing = dto.permissionKeys.filter((k) => !found.has(k));
      throw new BadRequestException(`Unknown permission keys: ${missing.join(', ')}`);
    }

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { role: targetRole } }),
      ...perms.map((perm) =>
        this.prisma.rolePermission.create({
          data: { role: targetRole, permissionId: perm.id },
        }),
      ),
    ]);

    const updated = await this.prisma.rolePermission.findMany({
      where: { role: targetRole },
      include: { permission: { select: { key: true } } },
    });
    return updated.map((rp) => rp.permission.key);
  }
}
