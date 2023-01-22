import { TwoFactorMethod } from '~common/constants/auth';
import { User } from '~common/grpc/interfaces/common';

export type SessionMetadataOptions = { allowUnverified?: boolean };

export interface SessionInterface {
  user: User;
  isAuthenticated: boolean;
}

export interface AuthenticatedSessionInterface extends SessionInterface {
  isAuthenticated: true;
}

export interface TwoFactorSessionData {
  verify?: Array<{ method: TwoFactorMethod; code: number }>;
  add?: {
    method: TwoFactorMethod;
    code: number;
    destination: string;
  };
  remove?: TwoFactorMethod[];
  expiresAt: number;
}

export interface TwoFactorSessionInterface extends SessionInterface {
  isAuthenticated: false;
  twoFactor: TwoFactorSessionData;
}

export interface TwoFactorAddedSessionInterface extends SessionInterface {
  isAuthenticated: false;
  twoFactor: {
    new: {
      method: TwoFactorMethod;
      code: number;
      destination: string;
    };
    expiresAt: number;
  };
}
