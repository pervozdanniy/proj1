import { SessionInterface } from '~common/session';
import {
  AgreementSessionInterface,
  RegisteredSessionInterface,
  RegisterSessionData,
  UserDetailsSessionData,
} from './interfaces';

export const isRegistered = (session: SessionInterface): session is RegisteredSessionInterface =>
  !!(session as RegisteredSessionInterface)?.register;

export const isAgreement = (session: SessionInterface): session is AgreementSessionInterface =>
  !!(session as AgreementSessionInterface)?.user_data;

export const startRegistration = <T extends SessionInterface>(session: T, data: RegisterSessionData) =>
  Object.assign(session, { register: data });

export const registerRequestAgreement = <T extends SessionInterface>(session: T, data: UserDetailsSessionData) =>
  Object.assign(session, { user_data: data });

export const finishRegistration = <T extends RegisteredSessionInterface, User>(
  session: T,
  user: User,
): T & SessionInterface<User> => {
  delete session.register;
  delete session.user_details;
  delete session.agreement;

  return Object.assign(session, { user });
};
