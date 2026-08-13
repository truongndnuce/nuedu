import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '@common/decorators/permissions.decorator';
import { Public } from '@common/decorators/public.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all categories (public, F-019)' })
  findAll() {
    return this.service.findAll();
  }

  @Get('admin')
  @ApiBearerAuth()
  @Permissions('categories.view', 'categories.manage')
  @ApiOperation({ summary: 'List all categories (admin)' })
  findAllAdmin() {
    return this.service.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @Permissions('categories.manage')
  @ApiOperation({ summary: 'Create category (F-019)' })
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Permissions('categories.manage')
  @ApiOperation({ summary: 'Update category (F-019)' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Permissions('categories.manage')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete category (F-019)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
