import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../config/prisma.service';

interface JwtPayload {
  sub: string;
  role: string;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.accessSecret')!,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub, isActive: true },
    });

    if (!user) throw new UnauthorizedException();

    // Resolve base permissions: custom role takes precedence over system role defaults
    const basePerms = user.customRoleId
      ? await this.prisma.customRolePermission.findMany({
          where: { customRoleId: user.customRoleId },
          include: { permission: true },
        }).then((perms) => perms.map((p) => p.permission.key))
      : await this.prisma.rolePermission.findMany({
          where: { role: user.role },
          include: { permission: true },
        }).then((perms) => perms.map((rp) => rp.permission.key));

    const userPerms = await this.prisma.userPermission.findMany({
      where: { userId: user.id },
      include: { permission: true },
    });

    const granted = new Set(basePerms);

    for (const up of userPerms) {
      if (up.granted) {
        granted.add(up.permission.key);
      } else {
        granted.delete(up.permission.key);
      }
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      customRoleId: user.customRoleId,
      isActive: user.isActive,
      effectivePermissions: Array.from(granted),
    };
  }
}
