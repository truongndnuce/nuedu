import { Module } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  providers: [PrismaService, RolesService],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule {}
