import {
  AuthenticatedSessionInterface,
  SessionInterface,
  TwoFactorSessionInterface,
} from './interfaces/session.interface';

export const isAuthenticated = (session: Record<string, any>): session is AuthenticatedSessionInterface =>
  session.isAuthenticated && Object.prototype.hasOwnProperty.call(session, 'user');

export const is2FA = (session: Record<string, any>): session is TwoFactorSessionInterface =>
  !session.isAuthenticated &&
  Object.prototype.hasOwnProperty.call(session, 'user') &&
  Object.prototype.hasOwnProperty.call(session, 'twoFactor');

export const authenticate = (session: SessionInterface): AuthenticatedSessionInterface => {
  if (is2FA(session)) {
    delete session.twoFactor;
  }

  return Object.assign(session, { isAuthenticated: true as const });
};

export const require2FA = (
  session: SessionInterface,
  data: TwoFactorSessionInterface['twoFactor'],
): TwoFactorSessionInterface => Object.assign(session, { isAuthenticated: false as const, twoFactor: data });
