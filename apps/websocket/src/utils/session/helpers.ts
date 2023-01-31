import { SessionInterface } from '~common/session';
import { BoundSessionInterface } from './interfaces';

export const isBound = (session: SessionInterface): session is BoundSessionInterface =>
  !!(session as BoundSessionInterface).socketIds;

export const bind = (session: SessionInterface, socketId: string): BoundSessionInterface => {
  if (isBound(session)) {
    session.socketIds.push(socketId);

    return session;
  }

  return Object.assign(session, { socketIds: [socketId] });
};
