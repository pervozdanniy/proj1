import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

export type SessionKey = string | number;

export const buildKey = (key: SessionKey) => `session:auth:${key}`;

@Injectable()
export class RedisStore {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  get(sessionId: SessionKey): Promise<string | null> {
    return this.redis.get(buildKey(sessionId));
  }

  async set(sessionId: SessionKey, value: string): Promise<void> {
    await this.redis.set(buildKey(sessionId), value);
  }

  async destroy(sessionId: SessionKey) {
    await this.redis.del(buildKey(sessionId));
  }
}
