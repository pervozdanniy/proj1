import { Logger } from '@nestjs/common';
import { SessionService } from './session.service';

export type SessionProxy<T> = SessionHost<T> & T;

export const sessionProxyFactory = <T extends Record<PropertyKey, any>>(
  session: SessionService<T>,
  id: string,
  data: T,
): SessionProxy<T> => {
  const host = new SessionHost(session, id, data);

  return new Proxy(host, {
    get(target, p) {
      if (Reflect.has(target, p)) {
        return Reflect.get(target, p);
      }

      return host.get(p);
    },
    set(target, p, value) {
      host.set(p, value);

      return true;
    },
    deleteProperty(target, p) {
      host.delete(p);

      return true;
    },
    has(target, p) {
      return host.has(p);
    },
  }) as SessionHost<T> & T;
};

export class SessionHost<T extends Record<string, any> = Record<string, any>> {
  private modified = false;

  private logger = new Logger(SessionHost.name);

  constructor(private readonly session: SessionService<T>, private id: string, private data: T) {}

  get sessionId() {
    return this.id;
  }

  get isModified() {
    return this.modified;
  }

  async regenerate() {
    await this.session.destroy(this.id);
    this.id = await this.session.generate();
  }

  async destroy() {
    await this.session.destroy(this.id);
    for (const key in this.data) {
      delete this.data[key];
    }
    this.modified = false;
  }

  async reload() {
    this.data = await this.session.get(this.id);
    this.modified = false;
  }

  async save() {
    try {
      await this.session.set(this.id, this.data);
      this.modified = false;

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
    this.modified = true;
    this.data[prop] = value;
  }

  delete(prop: keyof T) {
    this.modified = true;
    delete this.data[prop];
  }
}
