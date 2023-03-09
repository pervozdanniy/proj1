import { SessionInterface } from '~common/session';
import { PreRegisteredSessionInterface, PreRegisterSessionData } from './interfaces';

export const isPreRegistered = (session: SessionInterface): session is PreRegisteredSessionInterface =>
  !!(session as PreRegisteredSessionInterface)?.register;

export const startRegistration = <T extends SessionInterface>(session: T, data: PreRegisterSessionData) =>
  Object.assign(session, { register: data });

export const finishRegistration = <T extends PreRegisteredSessionInterface, User>(
  session: T,
  user: User,
): T & SessionInterface<User> => {
  delete session.register;

  return Object.assign(session, { user });
};
