import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@config/prisma.service';
import { ChatBroadcastService } from './chat-broadcast.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { GuestController } from './guest.controller';
import { StaffController } from './staff.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessSecret'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [GuestController, StaffController],
  providers: [ChatService, ChatGateway, ChatBroadcastService, PrismaService],
  exports: [ChatService],
})
export class ChatModule {}
