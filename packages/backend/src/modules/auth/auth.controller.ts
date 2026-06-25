import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CurrentUser, Public } from '../../common/decorators';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface AuthUser {
  id: string;
  role: string;
  effectivePermissions: string[];
}

const REFRESH_COOKIE = 'nuedu_refresh';
const IS_PROD = process.env.NODE_ENV === 'production';
// Cross-site (frontend & backend on different domains) requires SameSite=None,
// which the browser only accepts together with Secure (HTTPS).
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: (IS_PROD ? 'none' : 'lax') as 'none' | 'lax',
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Register a new admin account' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const { accessToken, refreshToken, user } = await this.authService.register(
      dto,
      ip,
      userAgent,
    );

    res.setCookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);

    return { accessToken, user };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Staff/Admin login' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const { accessToken, refreshToken, user } = await this.authService.login(
      dto,
      ip,
      userAgent,
    );

    res.setCookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);

    return { accessToken, user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refreshToken')
  @ApiOperation({ summary: 'Rotate refresh token and get new access token' })
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const rawToken = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE];
    if (!rawToken) throw new UnauthorizedException('No refresh token');

    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const { accessToken, refreshToken } = await this.authService.refresh(
      rawToken,
      ip,
      userAgent,
    );

    res.setCookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const rawToken = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE];
    if (rawToken) {
      await this.authService.logout(rawToken);
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile + effective permissions' })
  async me(@CurrentUser() user: AuthUser) {
    return this.authService.getMe(user.id);
  }

  @Patch('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update own profile (name or password)' })
  async updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: { fullName?: string; currentPassword?: string; newPassword?: string },
  ) {
    await this.authService.updateProfile(user.id, dto);
  }
}
