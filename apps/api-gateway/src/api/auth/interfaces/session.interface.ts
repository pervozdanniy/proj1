import { SessionMetadataOptions as BaseOptions, With2FA, WithRegistration, WithReset } from '~common/session';

export type SessionMetadataOptions = WithReset<WithRegistration<With2FA<BaseOptions>>> & { requireKYC?: boolean };
