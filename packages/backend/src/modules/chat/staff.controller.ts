import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Permissions } from '@common/decorators/permissions.decorator';
import { ChatService } from './chat.service';
import { AssignConversationDto } from './dto/assign-conversation.dto';
import { ListConversationsDto } from './dto/list-conversations.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { SendStaffMessageDto } from './dto/send-message.dto';

@ApiTags('Chat — Staff')
@ApiBearerAuth()
@Controller('chat/conversations')
export class StaffController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @Permissions('chat.read.all', 'chat.read.assigned')
  @ApiOperation({ summary: 'List conversations inbox (F-043)' })
  list(
    @Query() dto: ListConversationsDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('effectivePermissions') perms: string[],
  ) {
    return this.chatService.listConversations(dto, userId, perms.includes('chat.read.all'));
  }

  @Get(':id')
  @Permissions('chat.read.all', 'chat.read.assigned')
  @ApiOperation({ summary: 'Get conversation detail (F-044)' })
  getOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('effectivePermissions') perms: string[],
  ) {
    return this.chatService.getConversation(id, userId, perms.includes('chat.read.all'));
  }

  @Get(':id/messages')
  @Permissions('chat.read.all', 'chat.read.assigned')
  @ApiOperation({ summary: 'Get messages (cursor-based, F-044)' })
  @ApiQuery({ name: 'before', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getMessages(
    @Param('id') id: string,
    @Query('before') before: string | undefined,
    @Query('limit') limit: string | undefined,
    @CurrentUser('id') userId: string,
    @CurrentUser('effectivePermissions') perms: string[],
  ) {
    return this.chatService.getMessages(id, userId, perms.includes('chat.read.all'), before, limit ? parseInt(limit) : 50);
  }

  @Post(':id/messages')
  @Permissions('chat.reply')
  @ApiOperation({ summary: 'Staff send message REST fallback (F-045)' })
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendStaffMessageDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('effectivePermissions') perms: string[],
  ) {
    return this.chatService.sendStaffMessage(id, dto, userId, perms.includes('chat.read.all'));
  }

  @Post(':id/assign')
  @Permissions('chat.assign')
  @ApiOperation({ summary: 'Assign conversation to staff (F-046)' })
  assign(
    @Param('id') id: string,
    @Body() dto: AssignConversationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.assignConversation(id, dto, userId);
  }

  @Post(':id/close')
  @Permissions('chat.close')
  @ApiOperation({ summary: 'Close conversation (F-047)' })
  close(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.chatService.closeConversation(id, userId);
  }

  @Post(':id/reopen')
  @Permissions('chat.close')
  @ApiOperation({ summary: 'Reopen closed conversation (F-047)' })
  reopen(@Param('id') id: string) {
    return this.chatService.reopenConversation(id);
  }

  @Post(':id/read')
  @Permissions('chat.read.all', 'chat.read.assigned')
  @HttpCode(204)
  @ApiOperation({ summary: 'Mark messages as read by staff (F-048)' })
  markRead(
    @Param('id') id: string,
    @Body() dto: MarkReadDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.markRead(id, userId, dto);
  }
}
