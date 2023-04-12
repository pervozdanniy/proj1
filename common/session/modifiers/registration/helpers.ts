import { UserSourceEnum } from '~common/constants/user';
import { SessionInterface } from '~common/session';
import {
  AgreementSessionInterface,
  RegisterSessionData,
  RegisterSessionInterface,
  UserDetailsSessionData,
} from './interfaces';

export const isRegistration = (session: SessionInterface): session is RegisterSessionInterface =>
  !!(session as RegisterSessionInterface)?.register;

export const isRegistrationAgreement = (session: SessionInterface): session is AgreementSessionInterface =>
  isRegistration(session) && !!(session as AgreementSessionInterface)?.user_data;

export const startRegistration = <T extends SessionInterface>(session: T, data: RegisterSessionData) =>
  Object.assign(session, { register: data });

export const registerRequestAgreement = <T extends SessionInterface>(session: T, data: UserDetailsSessionData) =>
  Object.assign(session, { user_data: data });

export const isSocial = (session: SessionInterface): boolean => session.user.source !== UserSourceEnum.Api;

export const finishRegistration = <T extends RegisterSessionInterface, User>(
  session: T,
  user: User,
): T & SessionInterface<User> => {
  delete session.register;
  delete session.user_details;
  delete session.agreement;

  return Object.assign(session, { user });
};

export const registerIsSocial = (session: RegisterSessionInterface): boolean =>
  session.register.source &&
  Object.values(UserSourceEnum).includes(session.register.source as UserSourceEnum) &&
  session.register.source !== UserSourceEnum.Api;
