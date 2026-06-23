import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '@config/prisma.service';
import { PostsModule } from '@modules/posts/posts.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot(), PostsModule],
  providers: [SchedulerService, PrismaService],
})
export class AppSchedulerModule {}
