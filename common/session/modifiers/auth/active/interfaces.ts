import { SessionMetadataOptions } from '../../../index';

export type WithActive<T extends SessionMetadataOptions> = T & {
  allowClosed?: boolean;
};
