import { Injectable } from '@nestjs/common';

// Redis stub — not used in this environment
@Injectable()
export class RedisService {
  async ping(): Promise<boolean> {
    return false;
  }
}
