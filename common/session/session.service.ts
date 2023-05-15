import { Injectable } from '@nestjs/common';
import uid from 'uid-safe';
import { SessionInterface } from './interfaces/session.interface';
import { RedisStore } from './redis.store';
import { ProxyOptions, SessionProxy, sessionProxyFactory } from './session-host';

@Injectable()
export class SessionService<T extends Record<PropertyKey, any> = SessionInterface> {
  constructor(private readonly store: RedisStore, private readonly opts: ProxyOptions) {}

  async generate(): Promise<SessionProxy<T>> {
    const id = await uid(18);

    return sessionProxyFactory(this.store, id, null, this.opts);
  }

  async get<U extends T>(id: string): Promise<SessionProxy<U>> {
    const data = await this.store.get(id);

    return sessionProxyFactory(this.store, id, data, this.opts);
  }
}
