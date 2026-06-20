import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class FastifyThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    return { req, res };
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ip ?? req.headers?.['x-forwarded-for'] ?? 'unknown';
  }
}
