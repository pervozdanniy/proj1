import { TwoFactorMethod } from '~common/constants/auth';
import { User } from '~common/grpc/interfaces/common';
import { SessionProxy } from '../session-host';

export type SessionMetadataOptions = { allowUnverified?: boolean };

export interface SessionInterface {
  user: User;
}

export type WithSession<T, Session extends SessionInterface = SessionInterface> = T & {
  session: SessionProxy<Session>;
};

export type TwoFactorSessionData = {
  verify?: Array<{ method: TwoFactorMethod; code: number }>;
  add?: {
    method: TwoFactorMethod;
    code: number;
    destination: string;
  };
  remove?: TwoFactorMethod[];
  expiresAt: number;
};

export interface TwoFactorSessionInterface extends SessionInterface {
  twoFactor: TwoFactorSessionData;
}
