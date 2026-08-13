import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../../config/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  avatarUrl: true,
  role: true,
  customRoleId: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(dto: ListUsersDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(dto.role !== undefined && { role: dto.role }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ where, select: USER_SELECT, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(dto: CreateUserDto, createdById: string) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');

    const password = dto.password ?? this.generateTempPassword();
    const passwordHash = await this.hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        role: dto.role ?? UserRole.STAFF,
        avatarUrl: dto.avatarUrl,
        customRoleId: dto.customRoleId ?? null,
        createdById,
      },
      select: USER_SELECT,
    });

    void this.audit.log({ userId: createdById, action: 'user.create', entityType: 'User', entityId: user.id, metadata: { email: dto.email, role: dto.role } });
    return { ...user, temporaryPassword: dto.password ? undefined : password };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: USER_SELECT });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.assertExists(id);

    if (dto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing && existing.id !== id) throw new ConflictException('Email already in use');
    }

    const data: Record<string, unknown> = {
      ...(dto.email && { email: dto.email }),
      ...(dto.fullName && { fullName: dto.fullName }),
      ...(dto.role && { role: dto.role }),
      ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      ...('customRoleId' in dto && { customRoleId: dto.customRoleId ?? null }),
    };

    if (dto.password) {
      data.passwordHash = await this.hashPassword(dto.password);
    }

    return this.prisma.user.update({ where: { id }, data, select: USER_SELECT });
  }

  async softDelete(id: string, requestingUserId: string) {
    if (id === requestingUserId) throw new BadRequestException('Cannot deactivate yourself');
    await this.assertExists(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: USER_SELECT,
    });
    void this.audit.log({ userId: requestingUserId, action: 'user.delete', entityType: 'User', entityId: id });
    return user;
  }

  async resetPassword(id: string) {
    await this.assertExists(id);
    const tempPassword = this.generateTempPassword();
    const passwordHash = await this.hashPassword(tempPassword);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { temporaryPassword: tempPassword };
  }

  async getPermissions(id: string) {
    await this.assertExists(id);
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id }, select: { role: true, customRoleId: true } });

    const [basePerms, userPerms] = await Promise.all([
      user.customRoleId
        ? this.prisma.customRolePermission.findMany({
            where: { customRoleId: user.customRoleId },
            include: { permission: true },
          }).then((perms) => perms.map((p) => ({ permission: p.permission })))
        : this.prisma.rolePermission.findMany({
            where: { role: user.role },
            include: { permission: true },
          }),
      this.prisma.userPermission.findMany({
        where: { userId: id },
        include: { permission: true },
      }),
    ]);

    const baseKeys = new Set(basePerms.map((rp) => rp.permission.key));
    const overrides = userPerms.map((up) => ({ key: up.permission.key, granted: up.granted }));

    const effective = new Set(baseKeys);
    for (const up of userPerms) {
      if (up.granted) effective.add(up.permission.key);
      else effective.delete(up.permission.key);
    }

    return {
      role: user.role,
      customRoleId: user.customRoleId,
      roleDefaults: Array.from(baseKeys),
      overrides,
      effective: Array.from(effective),
    };
  }

  async updatePermissions(id: string, dto: UpdatePermissionsDto, updatedById?: string) {
    await this.assertExists(id);

    const permKeys = dto.permissions.map((p) => p.key);
    const perms = await this.prisma.permission.findMany({ where: { key: { in: permKeys } } });

    if (perms.length !== permKeys.length) {
      const found = new Set(perms.map((p) => p.key));
      const missing = permKeys.filter((k) => !found.has(k));
      throw new BadRequestException(`Unknown permission keys: ${missing.join(', ')}`);
    }

    const permByKey = new Map(perms.map((p) => [p.key, p]));

    await this.prisma.$transaction(
      dto.permissions.map(({ key, granted }) => {
        const perm = permByKey.get(key)!;
        return this.prisma.userPermission.upsert({
          where: { userId_permissionId: { userId: id, permissionId: perm.id } },
          update: { granted },
          create: { userId: id, permissionId: perm.id, granted },
        });
      }),
    );

    void this.audit.log({ userId: updatedById, action: 'permission.update', entityType: 'User', entityId: id, metadata: { permissions: dto.permissions } });
    return this.getPermissions(id);
  }

  private async assertExists(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) throw new NotFoundException('User not found');
  }

  private async hashPassword(password: string) {
    return argon2.hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
  }

  private generateTempPassword(): string {
    return 'nuedu12345';
  }
}
