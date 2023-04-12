import { SessionMetadataOptions } from '../../../index';

export type WithActive<T extends SessionMetadataOptions> = T & {
  allowClosed?: boolean;
};

export type ForbidSocial<T extends SessionMetadataOptions> = T & { forbidSocial?: boolean };
