import { Module } from '@nestjs/common';
import { PrismaService } from '@config/prisma.service';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './testimonials.service';

@Module({
  controllers: [TestimonialsController],
  providers: [TestimonialsService, PrismaService],
  exports: [TestimonialsService],
})
export class TestimonialsModule {}
