import { Body, Controller, Get, HttpCode, NotFoundException, Patch, Post, Put, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from '@common/decorators/public.decorator';
import { ChatService } from './chat.service';
import { CreateGuestSessionDto } from './dto/create-guest-session.dto';
import { SendGuestMessageDto } from './dto/send-message.dto';
import { UpdateGuestSessionDto } from './dto/update-guest-session.dto';

const GUEST_COOKIE = 'nuedu_guest_id';
const GUEST_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60,
};

@ApiTags('Chat — Guest')
@Public()
@Controller('chat/guest')
export class GuestController {
  constructor(private readonly chatService: ChatService) {}

  @Post('session')
  @ApiOperation({ summary: 'Create or restore guest session (F-039)' })
  async createSession(
    @Body() dto: CreateGuestSessionDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const cookieId = cookies[GUEST_COOKIE];
    const { session, isNew } = await this.chatService.createOrRestoreSession(
      dto,
      cookieId,
      req.ip,
      req.headers['user-agent'],
    );

    if (isNew || !cookieId) {
      res.setCookie(GUEST_COOKIE, session.id, GUEST_COOKIE_OPTS);
    }

    return { guestSessionId: session.id, locale: session.locale, displayName: session.displayName };
  }

  @Get('conversation')
  @ApiCookieAuth(GUEST_COOKIE)
  @ApiOperation({ summary: 'Get current guest conversation + last 50 messages (F-040)' })
  async getConversation(@Req() req: FastifyRequest) {
    const guestId = this.requireGuestCookie(req);
    const result = await this.chatService.getGuestConversation(guestId);
    if (!result) throw new NotFoundException('No active conversation');
    return result;
  }

  @Post('messages')
  @ApiCookieAuth(GUEST_COOKIE)
  @ApiOperation({ summary: 'Guest send message REST fallback (F-041)' })
  async sendMessage(@Body() dto: SendGuestMessageDto, @Req() req: FastifyRequest) {
    const guestId = this.requireGuestCookie(req);
    return this.chatService.sendGuestMessage(guestId, dto);
  }

  @Patch('session')
  @ApiCookieAuth(GUEST_COOKIE)
  @ApiOperation({ summary: 'Update guest info (F-042)' })
  async updateSession(@Body() dto: UpdateGuestSessionDto, @Req() req: FastifyRequest) {
    const guestId = this.requireGuestCookie(req);
    return this.chatService.updateGuestSession(guestId, dto);
  }

  @Put('typing')
  @HttpCode(204)
  @ApiCookieAuth(GUEST_COOKIE)
  @ApiOperation({ summary: 'Guest is typing indicator' })
  async setTyping(@Req() req: FastifyRequest) {
    const guestId = this.requireGuestCookie(req);
    const conv = await this.chatService.findActiveGuestConversation(guestId);
    if (conv) this.chatService.setTyping(conv.id, 'guest');
  }

  @Get('typing')
  @ApiCookieAuth(GUEST_COOKIE)
  @ApiOperation({ summary: 'Get staff typing state for guest conversation' })
  async getTyping(@Req() req: FastifyRequest) {
    const guestId = this.requireGuestCookie(req);
    const conv = await this.chatService.findActiveGuestConversation(guestId);
    if (!conv) return { staffTyping: false };
    const { staffTyping } = this.chatService.getTyping(conv.id);
    return { staffTyping };
  }

  private requireGuestCookie(req: FastifyRequest): string {
    const cookies = req.cookies as Record<string, string | undefined>;
    const guestId = cookies[GUEST_COOKIE];
    if (!guestId) throw new Error('Guest session cookie missing');
    return guestId;
  }
}
