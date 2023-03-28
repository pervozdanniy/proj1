import { SessionInterface } from '~common/session';
import { TwoFactorSessionData, TwoFactorSessionInterface } from './interfaces';

export const is2FA = (session: SessionInterface): session is TwoFactorSessionInterface =>
  !!(session as TwoFactorSessionInterface)?.twoFactor;

export const require2FA = <T extends SessionInterface>(
  session: T,
  data: Omit<TwoFactorSessionData<false>, 'isVerified'>,
): T & TwoFactorSessionInterface => Object.assign(session, { twoFactor: { isVerified: false as const, ...data } });

export const confirm2FA = <T extends TwoFactorSessionInterface>(session: T): TwoFactorSessionInterface<true> =>
  Object.assign(session, { twoFactor: { isVerified: true as const } });

export const confirm2FAMethod = (session: TwoFactorSessionInterface, method: string) => {
  const verify = (session.twoFactor.verify ?? []).filter((c) => c.method !== method);
  if (verify.length === 0 && !session.twoFactor.add) {
    return confirm2FA(session);
  }

  session.twoFactor.verify = verify;

  return session;
};
