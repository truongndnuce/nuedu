import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '@common/decorators/permissions.decorator';
import { Public } from '@common/decorators/public.decorator';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly service: TestimonialsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List active testimonials (public)' })
  findAll() {
    return this.service.findAll();
  }

  @Get('admin')
  @ApiBearerAuth()
  @Permissions('testimonials.view', 'testimonials.manage')
  @ApiOperation({ summary: 'List all testimonials including inactive (admin)' })
  findAllAdmin() {
    return this.service.findAllAdmin();
  }

  @Post()
  @ApiBearerAuth()
  @Permissions('testimonials.manage')
  @ApiOperation({ summary: 'Create testimonial' })
  create(@Body() dto: CreateTestimonialDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Permissions('testimonials.manage')
  @ApiOperation({ summary: 'Update testimonial' })
  update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Permissions('testimonials.manage')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete testimonial' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
