import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

export type SessionKey = string | number;

@Injectable()
export class RedisStore {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  private buildKey(key: SessionKey) {
    return `auth:session:${key}`;
  }

  get(sessionId: SessionKey): Promise<string | null> {
    return this.redis.get(this.buildKey(sessionId));
  }

  async set(sessionId: SessionKey, value: string): Promise<void> {
    await this.redis.set(this.buildKey(sessionId), value);
  }
}
