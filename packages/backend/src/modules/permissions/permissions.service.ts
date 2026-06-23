import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.permission.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
      select: { id: true, key: true, group: true, description: true },
    });
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
