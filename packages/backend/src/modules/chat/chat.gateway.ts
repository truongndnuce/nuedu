import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ConversationStatus, MessageSenderType } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '@config/prisma.service';
import { ChatBroadcastService } from './chat-broadcast.service';

interface StaffSocket extends Socket {
  data: {
    type: 'staff';
    user: { sub: string; role: string };
  };
}

interface GuestSocket extends Socket {
  data: {
    type: 'guest';
    guestSessionId: string;
  };
}

type AuthenticatedSocket = StaffSocket | GuestSocket;

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*', credentials: true },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly broadcast: ChatBroadcastService,
  ) {}

  afterInit(server: Server) {
    this.broadcast.setServer(server);
    this.logger.log('Chat gateway initialized');
  }

  async handleConnection(socket: Socket) {
    try {
      const auth = socket.handshake.auth as Record<string, string>;
      const cookies = this.parseCookies(socket.handshake.headers.cookie ?? '');

      if (auth.token) {
        const token = auth.token.replace(/^Bearer\s+/i, '');
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_ACCESS_SECRET,
        });
        socket.data = { type: 'staff', user: payload };
        socket.join('staff:lobby');
        socket.join(`user:${payload.sub}`);
        this.logger.log(`Staff connected: ${payload.sub}`);
      } else {
        const guestId = auth.guestSessionId || cookies['nuedu_guest_id'];
        if (!guestId) { socket.disconnect(); return; }

        const session = await this.prisma.guestSession.findUnique({ where: { id: guestId } });
        if (!session) { socket.disconnect(); return; }

        socket.data = { type: 'guest', guestSessionId: session.id };

        const conversation = await this.prisma.conversation.findFirst({
          where: { guestSessionId: session.id, status: { not: ConversationStatus.CLOSED } },
          orderBy: { lastMessageAt: 'desc' },
        });
        if (conversation) {
          socket.join(`conversation:${conversation.id}`);
        }
        this.logger.log(`Guest connected: ${session.id}`);
      }
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Socket disconnected: ${socket.id} (${socket.data?.type})`);
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  @SubscribeMessage('conversation:join')
  async joinConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!data?.conversationId) return;

    const canJoin = await this.checkConversationAccess(socket, data.conversationId);
    if (!canJoin) {
      socket.emit('error', { message: 'Access denied' });
      return;
    }

    socket.join(`conversation:${data.conversationId}`);
    socket.emit('conversation:joined', { conversationId: data.conversationId });
  }

  @SubscribeMessage('conversation:leave')
  leaveConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (data?.conversationId) {
      socket.leave(`conversation:${data.conversationId}`);
    }
  }

  @SubscribeMessage('message:send')
  async sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string; content: string; attachments?: string[] },
  ) {
    if (!data?.conversationId || !data.content?.trim()) {
      socket.emit('error', { message: 'Invalid message data' });
      return;
    }

    try {
      const { type } = socket.data as any;
      let message: any;

      if (type === 'guest') {
        const { guestSessionId } = socket.data as any;
        const conversation = await this.prisma.conversation.findFirst({
          where: { id: data.conversationId, guestSessionId },
        });
        if (!conversation) { socket.emit('error', { message: 'Access denied' }); return; }

        message = await this.prisma.$transaction(async (tx) => {
          const msg = await tx.message.create({
            data: {
              conversationId: data.conversationId,
              senderType: MessageSenderType.GUEST,
              content: data.content,
              attachments: data.attachments ? (data.attachments as any) : undefined,
            },
          });
          await tx.conversation.update({
            where: { id: data.conversationId },
            data: { unreadByStaff: { increment: 1 }, lastMessageAt: new Date() },
          });
          return msg;
        });
      } else {
        const { user } = socket.data as any;
        const conversation = await this.prisma.conversation.findUnique({ where: { id: data.conversationId } });
        if (!conversation || conversation.status === ConversationStatus.CLOSED) {
          socket.emit('error', { message: 'Conversation not available' }); return;
        }

        message = await this.prisma.$transaction(async (tx) => {
          const msg = await tx.message.create({
            data: {
              conversationId: data.conversationId,
              senderType: MessageSenderType.STAFF,
              senderStaffId: user.sub,
              content: data.content,
              attachments: data.attachments ? (data.attachments as any) : undefined,
            },
          });
          await tx.conversation.update({
            where: { id: data.conversationId },
            data: { unreadByGuest: { increment: 1 }, lastMessageAt: new Date() },
          });
          return msg;
        });
      }

      this.server.to(`conversation:${data.conversationId}`).emit('message:new', message);
      socket.emit('message:ack', { messageId: message.id });
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  }

  @SubscribeMessage('message:read')
  async readMessages(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string; upToMessageId?: string },
  ) {
    if (!data?.conversationId) return;
    const { type } = socket.data as any;

    const where: any = { conversationId: data.conversationId };
    if (type === 'staff') {
      where.senderType = MessageSenderType.GUEST;
      where.readByStaffAt = null;
    } else {
      where.senderType = MessageSenderType.STAFF;
      where.readByGuestAt = null;
    }

    if (data.upToMessageId) {
      const ref = await this.prisma.message.findUnique({ where: { id: data.upToMessageId }, select: { createdAt: true } });
      if (ref) where.createdAt = { lte: ref.createdAt };
    }

    const updateData = type === 'staff' ? { readByStaffAt: new Date() } : { readByGuestAt: new Date() };
    await this.prisma.message.updateMany({ where, data: updateData });

    if (type === 'staff') {
      await this.prisma.conversation.update({ where: { id: data.conversationId }, data: { unreadByStaff: 0 } });
    } else {
      await this.prisma.conversation.update({ where: { id: data.conversationId }, data: { unreadByGuest: 0 } });
    }

    this.server.to(`conversation:${data.conversationId}`).emit('message:read', {
      conversationId: data.conversationId,
      readBy: type,
    });
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!data?.conversationId) return;
    socket.to(`conversation:${data.conversationId}`).emit('typing', {
      conversationId: data.conversationId,
      who: (socket.data as any).type,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!data?.conversationId) return;
    socket.to(`conversation:${data.conversationId}`).emit('typing', {
      conversationId: data.conversationId,
      who: (socket.data as any).type,
      isTyping: false,
    });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async checkConversationAccess(socket: Socket, conversationId: string): Promise<boolean> {
    const { type } = socket.data as any;
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) return false;

    if (type === 'guest') {
      return conv.guestSessionId === (socket.data as any).guestSessionId;
    }

    // Staff — for now allow all staff to join any conversation
    return true;
  }

  private parseCookies(cookieHeader: string): Record<string, string> {
    return Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k.trim(), decodeURIComponent(v.join('='))];
      }),
    );
  }
}
