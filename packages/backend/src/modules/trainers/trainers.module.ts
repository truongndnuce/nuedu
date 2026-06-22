import { Module } from '@nestjs/common';
import { PrismaService } from '@config/prisma.service';
import { TrainersController } from './trainers.controller';
import { TrainersService } from './trainers.service';

@Module({
  controllers: [TrainersController],
  providers: [TrainersService, PrismaService],
  exports: [TrainersService],
})
export class TrainersModule {}
