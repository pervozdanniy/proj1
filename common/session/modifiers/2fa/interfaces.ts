import { TwoFactorConstraint, TwoFactorMethod } from '~common/constants/auth';
import { SessionInterface, SessionMetadataOptions } from '~common/session';

export type TwoFactorSessionData<Verified extends boolean> = Verified extends true
  ? { isVerified: true }
  : {
      isVerified: false;
      verify?: Array<TwoFactorConstraint>;
      add?: Required<TwoFactorConstraint>;
      remove?: TwoFactorMethod[];
      expiresAt: number;
    };

export interface TwoFactorSessionInterface<Verified extends boolean = false> extends SessionInterface {
  twoFactor: TwoFactorSessionData<Verified>;
}

export type With2FA<T extends SessionMetadataOptions> = T & { allowUnverified?: boolean; require2FA?: boolean };
