import { SessionInterface, SessionMetadataOptions } from '~common/session';

export type ResetPassword<T extends SessionInterface> = T & {
  reset: true;
};

export type WithReset<T extends SessionMetadataOptions> = T & { requirePasswordReset?: boolean };
