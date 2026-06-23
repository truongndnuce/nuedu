import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Permissions } from '@common/decorators/permissions.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import { SchedulePostDto } from './dto/schedule-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Get()
  @Permissions('posts.update.own')
  @ApiOperation({ summary: 'List posts (staff view, F-030)' })
  findAll(
    @Query() dto: ListPostsDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('effectivePermissions') perms: string[],
  ) {
    return this.service.findAll(dto, userId, perms.includes('posts.update.any'));
  }

  @Post()
  @Permissions('posts.create')
  @ApiOperation({ summary: 'Create post (F-030)' })
  create(@Body() dto: CreatePostDto, @CurrentUser('id') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get(':id')
  @Permissions('posts.update.own')
  @ApiOperation({ summary: 'Get post detail (F-030)' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('effectivePermissions') perms: string[],
  ) {
    return this.service.findOne(id, userId, perms.includes('posts.update.any'));
  }

  @Patch(':id')
  @Permissions('posts.update.own')
  @ApiOperation({ summary: 'Update post (F-030, F-032)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('effectivePermissions') perms: string[],
  ) {
    return this.service.update(id, dto, userId, perms.includes('posts.update.any'));
  }

  @Delete(':id')
  @Permissions('posts.delete.own')
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft delete post (F-030)' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('effectivePermissions') perms: string[],
  ) {
    return this.service.softDelete(id, userId, perms.includes('posts.delete.any'));
  }

  @Post(':id/publish')
  @Permissions('posts.publish')
  @ApiOperation({ summary: 'Publish post (F-031)' })
  publish(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.publish(id, userId);
  }

  @Post(':id/unpublish')
  @Permissions('posts.publish')
  @ApiOperation({ summary: 'Unpublish post (F-031)' })
  unpublish(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.unpublish(id, userId);
  }

  @Post(':id/schedule')
  @Permissions('posts.schedule')
  @ApiOperation({ summary: 'Schedule post for future publish (F-031)' })
  schedule(@Param('id') id: string, @Body() dto: SchedulePostDto) {
    return this.service.schedule(id, dto);
  }

  @Post(':id/unschedule')
  @Permissions('posts.schedule')
  @ApiOperation({ summary: 'Unschedule post (F-031)' })
  unschedule(@Param('id') id: string) {
    return this.service.unschedule(id);
  }
}
