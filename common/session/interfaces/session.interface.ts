import { TwoFactorMethod } from '~common/constants/auth';
import { User } from '~common/grpc/interfaces/common';

export interface SessionInterface {
  user: User;
  isAuthenticated: boolean;
}

export interface AuthenticatedSessionInterface extends SessionInterface {
  isAuthenticated: true;
}

export interface TwoFactorRequiredSessionInterface extends SessionInterface {
  isAuthenticated: false;
  verify: {
    codes: Array<{ method: TwoFactorMethod; code: number }>;
    expiresAt: number;
  };
}
