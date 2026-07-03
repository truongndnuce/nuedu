import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ADMIN_ONLY_KEY } from '../decorators/admin-only.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface AuthUser {
  id: string;
  role: UserRole;
  effectivePermissions: string[];
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdminOnly = this.reflector.getAllAndOverride<boolean>(ADMIN_ONLY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isAdminOnly) {
      const user = context.switchToHttp().getRequest<{ user: AuthUser }>().user;
      if (!user || user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Admin access required');
      }
      return true;
    }

    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    const user = request.user;

    if (!user) return false;

    // ADMIN is a regular role now: its permissions come from RolePermission
    // just like any other role (seeded with every permission by default).

    // OR logic: user must have at least one of the required permissions
    const hasPermission = required.some((key) => user.effectivePermissions.includes(key));

    if (!hasPermission) {
      throw new ForbiddenException(
        `Missing required permission: ${required.join(' or ')}`,
      );
    }

    return true;
  }
}
