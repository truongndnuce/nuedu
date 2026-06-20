import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../../config/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, isActive: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = await this.generateAccessToken(user.id, user.role);
    const refreshToken = await this.createRefreshToken(user.id, ip, userAgent);

    const permissions = await this.getEffectivePermissions(user.id, user.role);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        permissions,
      },
    };
  }

  async refresh(rawToken: string, ip?: string, userAgent?: string) {
    const tokenHash = this.hashToken(rawToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      // Token reuse or expired: revoke all for user if found
      if (stored) {
        await this.prisma.refreshToken.updateMany({
          where: { userId: stored.userId },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!stored.user.isActive) throw new UnauthorizedException();

    // Rotate: revoke old, issue new
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const accessToken = await this.generateAccessToken(stored.userId, stored.user.role);
    const newRefreshToken = await this.createRefreshToken(stored.userId, ip, userAgent);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(rawToken: string) {
    const tokenHash = this.hashToken(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    const permissions = await this.getEffectivePermissions(userId, user.role);

    return { ...user, permissions };
  }

  private async generateAccessToken(userId: string, role: UserRole) {
    const jti = crypto.randomUUID();
    return this.jwtService.signAsync(
      { sub: userId, role, jti },
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expiresIn: this.configService.get('jwt.accessTtl') as any,
      },
    );
  }

  private async createRefreshToken(userId: string, ip?: string, userAgent?: string) {
    const raw = crypto.randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(raw);

    const ttlStr = this.configService.get<string>('jwt.refreshTtl') ?? '7d';
    const days = parseInt(ttlStr);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt, ip, userAgent },
    });

    return raw;
  }

  private hashToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  private async getEffectivePermissions(userId: string, role: UserRole): Promise<string[]> {
    const [rolePerms, userPerms] = await Promise.all([
      this.prisma.rolePermission.findMany({
        where: { role },
        include: { permission: true },
      }),
      this.prisma.userPermission.findMany({
        where: { userId },
        include: { permission: true },
      }),
    ]);

    const granted = new Set(rolePerms.map((rp) => rp.permission.key));

    for (const up of userPerms) {
      if (up.granted) {
        granted.add(up.permission.key);
      } else {
        granted.delete(up.permission.key);
      }
    }

    return Array.from(granted);
  }
}
