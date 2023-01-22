import { Injectable } from '@nestjs/common';
import uid from 'uid-safe';
import { RedisStore } from './redis.store';

@Injectable()
export class SessionService<T extends Record<string, any> = Record<string, any>> {
  constructor(private readonly store: RedisStore) {}

  generate() {
    return uid(18);
  }

  async destroy(id: string) {
    await this.store.destroy(id);
  }

  async get<U extends T>(id: string): Promise<U | null> {
    const session = await this.store.get(id);
    if (session) {
      return JSON.parse(session);
    }

    return null;
  }

  async set(id: string, session: T) {
    await this.store.set(id, JSON.stringify(session));
  }
}
