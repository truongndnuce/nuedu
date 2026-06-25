import {
  BadRequestException,
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
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, ip?: string, userAgent?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existing) throw new BadRequestException('Email đã được sử dụng');

    const passwordHash = await argon2.hash(dto.password, {
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        role: UserRole.ADMIN,
      },
      select: { id: true, email: true, fullName: true, avatarUrl: true, role: true, customRoleId: true },
    });

    const accessToken = await this.generateAccessToken(user.id, user.role);
    const refreshToken = await this.createRefreshToken(user.id, ip, userAgent);

    const permissions = await this.getEffectivePermissions(user.id, user.role, user.customRoleId ?? undefined);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        customRoleId: user.customRoleId,
        permissions,
      },
    };
  }

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, isActive: true },
      select: { id: true, email: true, fullName: true, avatarUrl: true, role: true, customRoleId: true, passwordHash: true, isActive: true },
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

    const permissions = await this.getEffectivePermissions(user.id, user.role, user.customRoleId ?? undefined);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        customRoleId: user.customRoleId,
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
        customRoleId: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    const permissions = await this.getEffectivePermissions(userId, user.role, user.customRoleId ?? undefined);

    return { ...user, permissions };
  }

  async updateProfile(userId: string, dto: { fullName?: string; currentPassword?: string; newPassword?: string }) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const data: Record<string, unknown> = {};

    if (dto.fullName) {
      data.fullName = dto.fullName;
    }

    if (dto.newPassword) {
      if (!dto.currentPassword) throw new BadRequestException('currentPassword is required');
      const valid = await argon2.verify(user.passwordHash, dto.currentPassword);
      if (!valid) throw new BadRequestException('Current password is incorrect');
      data.passwordHash = await argon2.hash(dto.newPassword, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
    }

    if (Object.keys(data).length === 0) return;

    await this.prisma.user.update({ where: { id: userId }, data });
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

  private async getEffectivePermissions(userId: string, role: UserRole, customRoleId?: string): Promise<string[]> {
    const [basePerms, userPerms] = await Promise.all([
      customRoleId
        ? this.prisma.customRolePermission.findMany({
            where: { customRoleId },
            include: { permission: true },
          }).then((perms) => perms.map((p) => p.permission.key))
        : this.prisma.rolePermission.findMany({
            where: { role },
            include: { permission: true },
          }).then((perms) => perms.map((rp) => rp.permission.key)),
      this.prisma.userPermission.findMany({
        where: { userId },
        include: { permission: true },
      }),
    ]);

    const granted = new Set(basePerms);

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
