import { Module } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

@Module({
  providers: [PrismaService, PermissionsService],
  controllers: [PermissionsController],
  exports: [PermissionsService],
})
export class PermissionsModule {}
