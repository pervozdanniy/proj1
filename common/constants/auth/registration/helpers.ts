import { SessionInterface } from '~common/session';
import { PreRegisteredSessionInterface } from './interfaces';

export const isPreRegistered = (session: SessionInterface): session is PreRegisteredSessionInterface =>
  !!(session as PreRegisteredSessionInterface)?.register;

export const register = <User = any>(session: PreRegisteredSessionInterface, user: User): SessionInterface<User> => {
  delete session.register;

  return Object.assign(session, { user });
};
