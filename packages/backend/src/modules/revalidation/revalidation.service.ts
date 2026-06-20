import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name);
  private readonly revalidateUrl: string | undefined;
  private readonly revalidateToken: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.revalidateUrl = config.get<string>('revalidate.url');
    this.revalidateToken = config.get<string>('revalidate.token');
  }

  async revalidate(paths: string[], slug?: string): Promise<void> {
    if (!this.revalidateUrl || !this.revalidateToken) {
      this.logger.warn('Revalidation not configured — skipping');
      return;
    }

    const allPaths = slug
      ? [...paths, `/vi/news/${slug}`, `/en/news/${slug}`]
      : paths;

    await this.attemptWithRetry(allPaths);
  }

  async revalidatePostSlug(slug: string): Promise<void> {
    await this.revalidate(['/vi', '/en', '/vi/news', '/en/news'], slug);
  }

  private async attemptWithRetry(paths: string[], attempt = 1): Promise<void> {
    try {
      const response = await fetch(this.revalidateUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-token': this.revalidateToken!,
        },
        body: JSON.stringify({ paths }),
      });

      if (!response.ok) {
        throw new Error(`Revalidation failed: HTTP ${response.status}`);
      }

      this.logger.log(`Revalidated ${paths.length} path(s): ${paths.join(', ')}`);
    } catch (err) {
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 500;
        this.logger.warn(`Revalidation attempt ${attempt} failed, retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        return this.attemptWithRetry(paths, attempt + 1);
      }
      this.logger.error(`Revalidation permanently failed after ${attempt} attempts`, err);
    }
  }
}
