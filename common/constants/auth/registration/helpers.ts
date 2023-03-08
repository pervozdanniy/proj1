import { SessionInterface } from '~common/session';
import {
  PreAgreementSessionData,
  PreAgreementSessionInterface,
  PreRegisteredSessionInterface,
  PreRegisterSessionData,
  UserDetailsSessionData,
} from './interfaces';

export const isPreRegistered = (session: SessionInterface): session is PreRegisteredSessionInterface =>
  !!(session as PreRegisteredSessionInterface)?.register;

export const isPreAgreement = (session: SessionInterface): session is PreAgreementSessionInterface =>
  !!(session as PreAgreementSessionInterface)?.agreement;

export const startRegistration = <T extends SessionInterface>(session: T, data: PreRegisterSessionData) =>
  Object.assign(session, { register: data });

export const saveUserDetailsInSession = <T extends SessionInterface>(session: T, data: UserDetailsSessionData) =>
  Object.assign(session, { user_details: data });

export const saveAgreementInSession = <T extends SessionInterface>(session: T, data: PreAgreementSessionData) =>
  Object.assign(session, { agreement: data });

export const finishRegistration = <User = any>(
  session: PreAgreementSessionInterface,
  user: User,
): SessionInterface<User> => {
  delete session.register;
  delete session.user_details;
  delete session.agreement;

  return Object.assign(session, { user });
};
