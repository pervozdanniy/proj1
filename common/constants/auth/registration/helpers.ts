import { SessionInterface } from '~common/session';
import { PreRegisteredSessionInterface, PreRegisterSessionData } from './interfaces';

export const isPreRegistered = (session: SessionInterface): session is PreRegisteredSessionInterface =>
  !!(session as PreRegisteredSessionInterface)?.register;

export const startRegistration = <T extends SessionInterface>(session: T, data: PreRegisterSessionData) =>
  Object.assign(session, { register: data });

export const finishRegistration = <User = any>(
  session: PreRegisteredSessionInterface,
  user: User,
): SessionInterface<User> => {
  delete session.register;

  return Object.assign(session, { user });
};
