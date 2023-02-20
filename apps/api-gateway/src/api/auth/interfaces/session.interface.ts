import { With2FA, WithPreRegistration, WithReset } from '~common/constants/auth';
import { SessionMetadataOptions as BaseOptions } from '~common/session';

export type SessionMetadataOptions = WithReset<WithPreRegistration<With2FA<BaseOptions>>>;
