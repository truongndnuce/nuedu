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

    // Resolve effective permissions
    const rolePerms = await this.prisma.rolePermission.findMany({
      where: { role: user.role },
      include: { permission: true },
    });

    const userPerms = await this.prisma.userPermission.findMany({
      where: { userId: user.id },
      include: { permission: true },
    });

    const granted = new Set(rolePerms.map((rp) => rp.permission.key));

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
      isActive: user.isActive,
      effectivePermissions: Array.from(granted),
    };
  }
}
