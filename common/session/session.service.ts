import { Injectable } from '@nestjs/common';
import uid from 'uid-safe';
import { RedisStore } from './redis.store';
import { SessionProxy, sessionProxyFactory } from './session-host';

@Injectable()
export class SessionService<T extends Record<PropertyKey, any> = Record<PropertyKey, any>> {
  constructor(private readonly store: RedisStore) {}

  async generate<TData extends T>(data?: TData): Promise<SessionProxy<TData>> {
    const id = await uid(18);

    return sessionProxyFactory(this.store, id, JSON.stringify(data));
  }

  async get<U extends T>(id: string): Promise<SessionProxy<U> | null> {
    const data = await this.store.get(id);
    if (data) {
      return sessionProxyFactory(this.store, id, data);
    }

    return null;
  }
}
