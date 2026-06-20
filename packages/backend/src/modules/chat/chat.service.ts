import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationStatus, MessageSenderType } from '@prisma/client';
import { PrismaService } from '@config/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ChatBroadcastService } from './chat-broadcast.service';
import { AssignConversationDto } from './dto/assign-conversation.dto';
import { CreateGuestSessionDto } from './dto/create-guest-session.dto';
import { ListConversationsDto } from './dto/list-conversations.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { SendGuestMessageDto, SendStaffMessageDto } from './dto/send-message.dto';
import { UpdateGuestSessionDto } from './dto/update-guest-session.dto';

const GUEST_COOKIE = 'nuedu_guest_id';
const MSG_SELECT = {
  id: true,
  conversationId: true,
  senderType: true,
  senderStaffId: true,
  content: true,
  attachments: true,
  readByStaffAt: true,
  readByGuestAt: true,
  createdAt: true,
};

const CONV_SELECT = {
  id: true,
  guestSessionId: true,
  assignedStaffId: true,
  status: true,
  subject: true,
  unreadByStaff: true,
  unreadByGuest: true,
  lastMessageAt: true,
  createdAt: true,
  closedAt: true,
  guestSession: { select: { id: true, displayName: true, phone: true, email: true, locale: true, lastSeenAt: true } },
  assignedStaff: { select: { id: true, fullName: true, avatarUrl: true } },
};

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly broadcast: ChatBroadcastService,
    private readonly audit: AuditService,
  ) {}

  // ─── GUEST ────────────────────────────────────────────────────────────────

  async createOrRestoreSession(
    dto: CreateGuestSessionDto,
    cookieSessionId?: string,
    ip?: string,
    userAgent?: string,
  ) {
    // Try cookie first, then body existingId
    const lookupId = cookieSessionId || dto.existingId;

    if (lookupId) {
      const existing = await this.prisma.guestSession.findUnique({ where: { id: lookupId } });
      if (existing) {
        await this.prisma.guestSession.update({
          where: { id: existing.id },
          data: { lastSeenAt: new Date() },
        });
        return { session: existing, isNew: false };
      }
    }

    const session = await this.prisma.guestSession.create({
      data: {
        displayName: dto.displayName,
        phone: dto.phone,
        email: dto.email,
        locale: dto.locale ?? 'vi',
        ipAddress: ip,
        userAgent,
      },
    });

    return { session, isNew: true };
  }

  async getGuestConversation(guestSessionId: string) {
    let conversation = await this.prisma.conversation.findFirst({
      where: { guestSessionId, status: { not: ConversationStatus.CLOSED } },
      orderBy: { lastMessageAt: 'desc' },
      select: CONV_SELECT,
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { guestSessionId, status: ConversationStatus.OPEN },
        select: CONV_SELECT,
      });
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: MSG_SELECT,
    });

    const hasMore = await this.prisma.message.count({ where: { conversationId: conversation.id } }) > 50;

    await this.prisma.message.updateMany({
      where: { conversationId: conversation.id, senderType: MessageSenderType.STAFF, readByGuestAt: null },
      data: { readByGuestAt: new Date() },
    });
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { unreadByGuest: 0 },
    });

    return { conversation, messages: messages.reverse(), hasMore };
  }

  async sendGuestMessage(guestSessionId: string, dto: SendGuestMessageDto) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: dto.conversationId, guestSessionId },
    });
    if (!conversation) throw new ForbiddenException('Conversation not found or access denied');

    const message = await this.prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderType: MessageSenderType.GUEST,
          content: dto.content,
          attachments: dto.attachments ? (dto.attachments as any) : undefined,
        },
        select: MSG_SELECT,
      });

      await tx.conversation.update({
        where: { id: conversation.id },
        data: {
          unreadByStaff: { increment: 1 },
          lastMessageAt: new Date(),
          status: conversation.status === ConversationStatus.CLOSED ? ConversationStatus.OPEN : undefined,
        },
      });

      return msg;
    });

    this.broadcast.toConversation(conversation.id, 'message:new', message);

    // Notify staff lobby if conversation was just created (no prior messages)
    const msgCount = await this.prisma.message.count({ where: { conversationId: conversation.id } });
    if (msgCount === 1) {
      this.broadcast.toStaffLobby('conversation:created', { conversationId: conversation.id, guestSessionId });
    }

    return message;
  }

  async updateGuestSession(guestSessionId: string, dto: UpdateGuestSessionDto) {
    return this.prisma.guestSession.update({
      where: { id: guestSessionId },
      data: { ...dto },
    });
  }

  // ─── STAFF ─────────────────────────────────────────────────────────────────

  async listConversations(dto: ListConversationsDto, userId: string, canReadAll: boolean) {
    const { page = 1, limit = 20, status, assignedToMe, search } = dto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (!canReadAll) {
      where.assignedStaffId = userId;
    } else if (assignedToMe) {
      where.assignedStaffId = userId;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.guestSession = {
        OR: [
          { displayName: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastMessageAt: 'desc' },
        select: {
          ...CONV_SELECT,
          messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true, createdAt: true, senderType: true } },
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getConversation(id: string, userId: string, canReadAll: boolean) {
    const conv = await this.prisma.conversation.findUnique({ where: { id }, select: CONV_SELECT });
    if (!conv) throw new NotFoundException('Conversation not found');
    if (!canReadAll && conv.assignedStaffId !== userId) throw new ForbiddenException('Access denied');
    return conv;
  }

  async getMessages(conversationId: string, userId: string, canReadAll: boolean, before?: string, limit = 50) {
    await this.getConversation(conversationId, userId, canReadAll);

    const where: any = { conversationId };
    if (before) {
      const ref = await this.prisma.message.findUnique({ where: { id: before }, select: { createdAt: true } });
      if (ref) where.createdAt = { lt: ref.createdAt };
    }

    const messages = await this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: MSG_SELECT,
    });

    return { messages: messages.reverse() };
  }

  async sendStaffMessage(conversationId: string, dto: SendStaffMessageDto, userId: string, canReadAll: boolean) {
    const conv = await this.getConversation(conversationId, userId, canReadAll);

    if (conv.status === ConversationStatus.CLOSED) {
      throw new BadRequestException('Conversation is closed');
    }

    const message = await this.prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId,
          senderType: MessageSenderType.STAFF,
          senderStaffId: userId,
          content: dto.content,
          attachments: dto.attachments ? (dto.attachments as any) : undefined,
        },
        select: MSG_SELECT,
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { unreadByGuest: { increment: 1 }, lastMessageAt: new Date() },
      });

      return msg;
    });

    this.broadcast.toConversation(conversationId, 'message:new', message);
    return message;
  }

  async assignConversation(id: string, dto: AssignConversationDto, currentUserId: string) {
    const conv = await this.prisma.conversation.findUnique({ where: { id } });
    if (!conv) throw new NotFoundException('Conversation not found');

    const staffId = dto.self ? currentUserId : dto.staffId;
    if (!staffId) throw new BadRequestException('Provide staffId or set self=true');

    const staff = await this.prisma.user.findFirst({ where: { id: staffId, isActive: true } });
    if (!staff) throw new NotFoundException('Staff not found');

    const updated = await this.prisma.$transaction(async (tx) => {
      const upd = await tx.conversation.update({
        where: { id },
        data: { assignedStaffId: staffId, status: ConversationStatus.ASSIGNED },
        select: CONV_SELECT,
      });

      await tx.message.create({
        data: {
          conversationId: id,
          senderType: MessageSenderType.SYSTEM,
          content: JSON.stringify({ vi: `Cuộc hội thoại được giao cho ${staff.fullName}`, en: `Conversation assigned to ${staff.fullName}` }),
        },
      });

      return upd;
    });

    this.broadcast.toConversation(id, 'conversation:assigned', updated);
    this.broadcast.toUser(staffId, 'conversation:assigned', updated);
    if (conv.assignedStaffId && conv.assignedStaffId !== staffId) {
      this.broadcast.toUser(conv.assignedStaffId, 'conversation:assigned', updated);
    }

    void this.audit.log({ userId: currentUserId, action: 'conversation.assign', entityType: 'Conversation', entityId: id, metadata: { staffId } });
    return updated;
  }

  async closeConversation(id: string, closedById?: string) {
    const conv = await this.prisma.conversation.findUnique({ where: { id } });
    if (!conv) throw new NotFoundException('Conversation not found');

    const updated = await this.prisma.conversation.update({
      where: { id },
      data: { status: ConversationStatus.CLOSED, closedAt: new Date() },
      select: CONV_SELECT,
    });

    this.broadcast.toConversation(id, 'conversation:closed', updated);
    void this.audit.log({ userId: closedById, action: 'conversation.close', entityType: 'Conversation', entityId: id });
    return updated;
  }

  async reopenConversation(id: string) {
    const conv = await this.prisma.conversation.findUnique({ where: { id } });
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.status !== ConversationStatus.CLOSED) throw new BadRequestException('Conversation is not closed');

    const newStatus = conv.assignedStaffId ? ConversationStatus.ASSIGNED : ConversationStatus.OPEN;
    return this.prisma.conversation.update({
      where: { id },
      data: { status: newStatus, closedAt: null },
      select: CONV_SELECT,
    });
  }

  async markRead(conversationId: string, userId: string, dto: MarkReadDto) {
    const where: any = {
      conversationId,
      senderType: MessageSenderType.GUEST,
      readByStaffAt: null,
    };

    if (dto.upToMessageId) {
      const ref = await this.prisma.message.findUnique({ where: { id: dto.upToMessageId }, select: { createdAt: true } });
      if (ref) where.createdAt = { lte: ref.createdAt };
    }

    await this.prisma.$transaction([
      this.prisma.message.updateMany({ where, data: { readByStaffAt: new Date() } }),
      this.prisma.conversation.update({ where: { id: conversationId }, data: { unreadByStaff: 0 } }),
    ]);

    this.broadcast.toConversation(conversationId, 'message:read', { conversationId, readBy: 'staff', userId });
  }
}
