import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '@common/decorators/permissions.decorator';
import { Public } from '@common/decorators/public.decorator';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsService } from './tags.service';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly service: TagsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all tags (public, F-020)' })
  findAll(@Query('search') search?: string) {
    return this.service.findAll(search);
  }

  @Post()
  @ApiBearerAuth()
  @Permissions('tags.manage')
  @ApiOperation({ summary: 'Create tag (F-020)' })
  create(@Body() dto: CreateTagDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Permissions('tags.manage')
  @ApiOperation({ summary: 'Update tag (F-020)' })
  update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Permissions('tags.manage')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete tag (F-020)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
