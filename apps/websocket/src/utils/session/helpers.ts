import { SessionInterface } from '~common/session';
import { BoundSessionInterface } from './interfaces';

export const isBound = (session: SessionInterface): session is BoundSessionInterface =>
  !!(session as BoundSessionInterface).socketId;

export const bind = (session: SessionInterface, socketId: string): BoundSessionInterface =>
  Object.assign(session, { socketId });
