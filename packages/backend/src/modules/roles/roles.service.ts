import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async list() {
    const roles = await this.prisma.customRole.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { permissions: true, users: true } },
      },
    });
    return roles.map(({ _count, ...role }) => ({
      ...role,
      permissionCount: _count.permissions,
      userCount: _count.users,
    }));
  }

  async create(dto: CreateRoleDto) {
    const exists = await this.prisma.customRole.findUnique({ where: { name: dto.name } });
    if (exists) throw new ConflictException('Role name already in use');

    return this.prisma.customRole.create({
      data: { name: dto.name, description: dto.description },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.customRole.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.customRole.findUnique({ where: { name: dto.name } });
      if (existing && existing.id !== id) throw new ConflictException('Role name already in use');
    }

    return this.prisma.customRole.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);

    const userCount = await this.prisma.user.count({ where: { customRoleId: id } });
    if (userCount > 0) {
      throw new BadRequestException(`Cannot delete role: ${userCount} user(s) are assigned to it`);
    }

    await this.prisma.customRole.delete({ where: { id } });
  }

  async getPermissions(id: string) {
    await this.findOne(id);
    const perms = await this.prisma.customRolePermission.findMany({
      where: { customRoleId: id },
      include: { permission: true },
    });
    return perms.map((p) => p.permission.key);
  }

  async updatePermissions(id: string, dto: UpdateRolePermissionsDto) {
    await this.findOne(id);

    const perms = await this.prisma.permission.findMany({
      where: { key: { in: dto.permissionKeys } },
    });

    if (perms.length !== dto.permissionKeys.length) {
      const found = new Set(perms.map((p) => p.key));
      const missing = dto.permissionKeys.filter((k) => !found.has(k));
      throw new BadRequestException(`Unknown permission keys: ${missing.join(', ')}`);
    }

    // Replace all permissions for this role
    await this.prisma.$transaction([
      this.prisma.customRolePermission.deleteMany({ where: { customRoleId: id } }),
      ...perms.map((perm) =>
        this.prisma.customRolePermission.create({
          data: { customRoleId: id, permissionId: perm.id },
        }),
      ),
    ]);

    return this.getPermissions(id);
  }
}
