import { SessionInterface } from '~common/session';
import { ChangeContactData, ChangeContactInfo } from './interfaces';

export const isChangeContactInfo = <T extends SessionInterface>(session: T): session is ChangeContactInfo<T> =>
  !!(session as ChangeContactInfo<T>).change;

export const changeContactInfo = <T extends SessionInterface>(
  session: T,
  payload: ChangeContactData,
): ChangeContactInfo<T> => Object.assign(session, { change: { email: payload.email, phone: payload.phone } });

export const changePhone = <T extends SessionInterface>(session: T, phone: string): ChangeContactInfo<T> =>
  Object.assign(session, { change: { phone } });

export const changeEmail = <T extends SessionInterface>(session: T, email: string): ChangeContactInfo<T> =>
  Object.assign(session, { change: { email } });
