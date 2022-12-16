import { SessionService } from './session.service';

export class SessionHost {
  private modified = false;

  constructor(private readonly session: SessionService, private id: string, private data = {}) {}

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
    this.data = {};
    this.modified = false;
  }

  async reload() {
    this.data = await this.session.get(this.id);
    this.modified = false;
  }

  async save() {
    this.session.set(this.id, this.data);
    this.modified = false;
  }

  get(prop: string) {
    return this.data[prop] ?? null;
  }

  set(prop: string, value: any) {
    this.modified = true;
    this.data[prop] = value;
  }

  delete(prop: string) {
    this.modified = true;
    delete this.data[prop];
  }
}
