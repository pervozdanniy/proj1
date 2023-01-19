import { AuthenticatedSessionInterface, TwoFactorRequiredSessionInterface } from './interfaces/session.interface';

export const isAuthenticated = (session: Record<string, any>): session is AuthenticatedSessionInterface =>
  session.isAuthenticated && Object.prototype.hasOwnProperty.call(session, 'user');

export const is2FA = (session: Record<string, any>): session is TwoFactorRequiredSessionInterface =>
  !session.isAuthenticated &&
  Object.prototype.hasOwnProperty.call(session, 'user') &&
  Object.prototype.hasOwnProperty.call(session, 'verify');
