import {
  SessionMetadataOptions as BaseOptions,
  With2FA,
  WithActive,
  WithKYC,
  WithRegistration,
  WithReset,
} from '~common/session';

export type SessionMetadataOptions = WithActive<WithKYC<WithReset<WithRegistration<With2FA<BaseOptions>>>>>;
