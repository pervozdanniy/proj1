import { Logger } from '@nestjs/common';
import crypto from 'node:crypto';
import { SessionInterface } from './interfaces/session.interface';
import { RedisStore } from './redis.store';

export type SessionProxy<T = SessionInterface> = SessionHost<T> & T;

export const sessionProxyFactory = <T extends Record<PropertyKey, unknown>>(
  store: RedisStore,
  id: string,
  data?: string,
): SessionProxy<T> => {
  const host = new SessionHost(store, id, data);

  return new Proxy(host, {
    get(_target, p) {
      if (Reflect.has(host, p)) {
        const own = Reflect.get(host, p);
        if (typeof own === 'function') {
          return own.bind(host);
        }

        return own;
      }

      return host.get(p);
    },
    set(_target, p, value) {
      host.set(p, value);

      return true;
    },
    deleteProperty(_target, p) {
      host.delete(p);

      return true;
    },
    has(_target, p) {
      return host.has(p);
    },
  }) as SessionHost<T> & T;
};

export class SessionHost<T extends Record<string, any> = Record<PropertyKey, unknown>> {
  private origHash: string;
  private data: T;

  private logger = new Logger(SessionHost.name);

  constructor(private readonly store: RedisStore, private sessionId: string, data?: string) {
    if (data) {
      this.origHash = this.hash(data);
      this.data = JSON.parse(data);
    } else {
      this.data = {} as T;
      this.origHash = this.hash('{}');
    }
  }

  private hash(data: string) {
    return crypto.createHash('sha1').update(data, 'utf8').digest('hex');
  }

  private isModified(data: string) {
    return this.hash(data) !== this.origHash;
  }

  get id() {
    return this.sessionId;
  }

  async destroy() {
    await this.store.destroy(this.sessionId);
    for (const key in this.data) {
      delete this.data[key];
    }
  }

  async reload() {
    const data = await this.store.get(this.sessionId);
    this.origHash = this.hash(data);
    this.data = JSON.parse(data);
  }

  async save(force = false) {
    const data = JSON.stringify(this.data);
    if (!force && !this.isModified(data)) {
      return false;
    }
    try {
      await this.store.set(this.sessionId, data);
      this.origHash = this.hash(data);

      return true;
    } catch (error) {
      this.logger.error('Session save: failed', error.stack, { error, sessionId: this.sessionId });

      return false;
    }
  }

  get(prop: keyof T) {
    return this.data[prop] ?? null;
  }

  has(prop: keyof T) {
    return prop in this.data;
  }

  set<K extends keyof T>(prop: K, value: T[K]) {
    this.data[prop] = value;
  }

  delete(prop: keyof T) {
    delete this.data[prop];
  }

  getData() {
    return this.data;
  }
}
