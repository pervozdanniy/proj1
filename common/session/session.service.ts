import { Injectable } from '@nestjs/common';
import uid from 'uid-safe';
import { SessionInterface } from './interfaces/session.interface';
import { RedisStore } from './redis.store';
import { SessionProxy, sessionProxyFactory } from './session-host';

@Injectable()
export class SessionService<T extends Record<PropertyKey, any> = SessionInterface> {
  constructor(private readonly store: RedisStore) {}

  async generate(): Promise<SessionProxy<T>> {
    const id = await uid(18);

    return sessionProxyFactory(this.store, id);
  }

  async get<U extends T>(id: string): Promise<SessionProxy<U>> {
    const data = await this.store.get(id);

    return sessionProxyFactory(this.store, id, data);
  }
}
