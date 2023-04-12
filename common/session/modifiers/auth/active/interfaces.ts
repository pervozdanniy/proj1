import { SessionMetadataOptions } from '../../../index';

export type WithActive<T extends SessionMetadataOptions> = T & {
  allowClosed?: boolean;
};

export type ForSocial<T extends SessionMetadataOptions> = T & { forSocial?: boolean };
