import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@config/prisma.service';
import { PostsService } from '@modules/posts/posts.service';
import { RevalidationService } from '@modules/revalidation/revalidation.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly postsService: PostsService,
    private readonly revalidation: RevalidationService,
  ) {}

  @Cron('*/1 * * * *')
  async autoPublishScheduledPosts(): Promise<void> {
    const slugs = await this.postsService.publishDueScheduled();
    if (slugs.length === 0) return;

    this.logger.log(`Auto-published ${slugs.length} post(s): ${slugs.join(', ')}`);

    for (const slug of slugs) {
      await this.revalidation.revalidatePostSlug(slug);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredRefreshTokens(): Promise<void> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
    this.logger.log(`Cleaned up ${result.count} expired/revoked refresh tokens`);
  }
}
