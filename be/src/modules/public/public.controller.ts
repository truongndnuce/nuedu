import { Body, Controller, Get, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { PublicService } from './public.service';

@ApiTags('Public')
@Public()
@Controller('public')
export class PublicController {
  constructor(private readonly service: PublicService) {}

  @Get('posts')
  @ApiOperation({ summary: 'List published posts (F-034)' })
  listPosts(
    @Query('locale') locale?: string,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listPosts({
      locale,
      category,
      tag,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('posts/latest')
  @ApiOperation({ summary: 'Get latest published posts (F-036)' })
  getLatest(@Query('limit') limit?: string) {
    return this.service.getLatestPosts(limit ? parseInt(limit) : 5);
  }

  @Get('posts/:slug')
  @ApiOperation({ summary: 'Get published post by slug (F-035)' })
  getPost(@Param('slug') slug: string, @Query('locale') locale?: string) {
    return this.service.getPost(slug, locale);
  }

  @Post('posts/:slug/view')
  @HttpCode(204)
  @ApiOperation({ summary: 'Increment view count (F-033)' })
  incrementView(@Param('slug') slug: string, @Req() req: any) {
    const ip = req.ip ?? req.connection?.remoteAddress ?? 'unknown';
    return this.service.incrementViewCount(slug, ip);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List categories with post count (F-037)' })
  getCategories() {
    return this.service.getCategories();
  }

  @Get('sitemap')
  @ApiOperation({ summary: 'Sitemap data for Next.js (F-038)' })
  getSitemap() {
    return this.service.getSitemapData();
  }
}
