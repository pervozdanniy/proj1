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

  async set(sessionId: SessionKey, value: string, ttl = 0): Promise<void> {
    if (ttl > 0) {
      await this.redis.set(buildKey(sessionId), value, 'EX', ttl);
    } else {
      await this.redis.set(buildKey(sessionId), value);
    }
  }

  async destroy(sessionId: SessionKey) {
    await this.redis.del(buildKey(sessionId));
  }

  async touch(sessionId: SessionKey, ttl: number) {
    const res = await this.redis.expire(buildKey(sessionId), ttl);

    return res > 0;
  }
}
