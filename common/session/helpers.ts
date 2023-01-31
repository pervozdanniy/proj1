import { SessionInterface, TwoFactorSessionInterface } from './interfaces/session.interface';

export const is2FA = (session: SessionInterface): session is TwoFactorSessionInterface =>
  !!(session as TwoFactorSessionInterface)?.twoFactor;

export const require2FA = (
  session: SessionInterface,
  data: TwoFactorSessionInterface['twoFactor'],
): TwoFactorSessionInterface => Object.assign(session, { twoFactor: data });

export const release2FA = (session: TwoFactorSessionInterface): SessionInterface => {
  delete session.twoFactor;

  return session;
};
