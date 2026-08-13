import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class ChatBroadcastService {
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  toConversation(conversationId: string, event: string, data: unknown) {
    this.server?.to(`conversation:${conversationId}`).emit(event, data);
  }

  toStaffLobby(event: string, data: unknown) {
    this.server?.to('staff:lobby').emit(event, data);
  }

  toUser(userId: string, event: string, data: unknown) {
    this.server?.to(`user:${userId}`).emit(event, data);
  }
}
