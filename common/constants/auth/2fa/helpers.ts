import { SessionInterface } from '~common/session';
import { TwoFactorSessionData, TwoFactorSessionInterface } from './interfaces';

export const is2FA = (session: SessionInterface): session is TwoFactorSessionInterface =>
  !!(session as TwoFactorSessionInterface)?.twoFactor;

export const require2FA = (
  session: SessionInterface,
  data: Omit<TwoFactorSessionData<false>, 'isVerified'>,
): TwoFactorSessionInterface => Object.assign(session, { twoFactor: { isVerified: false as const, ...data } });

export const confirm2FA = (session: TwoFactorSessionInterface): TwoFactorSessionInterface<true> =>
  Object.assign(session, { twoFactor: { isVerified: true as const } });
