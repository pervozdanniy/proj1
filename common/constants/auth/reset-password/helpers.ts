import { SessionInterface } from '~common/session';
import { ResetPassword } from './interfaces';

export const isPasswordReset = <T extends SessionInterface>(session: T): session is ResetPassword<T> =>
  (session as ResetPassword<T>).reset === true;

export const resetPassword = <T extends SessionInterface>(session: T): ResetPassword<T> =>
  Object.assign(session, { reset: true as const });

export const finishResetPassword = <T extends SessionInterface>(session: ResetPassword<T>): T => {
  delete session.reset;

  return session;
};
