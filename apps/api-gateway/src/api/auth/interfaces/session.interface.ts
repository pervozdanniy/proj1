import { With2FA, WithActive, WithKYC, WithRegistration, WithReset } from '~common/constants/auth';
import { SessionMetadataOptions as BaseOptions } from '~common/session';

export type SessionMetadataOptions = WithActive<WithKYC<WithReset<WithRegistration<With2FA<BaseOptions>>>>>;
