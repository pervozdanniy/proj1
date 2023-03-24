import { SessionMetadataOptions } from '../../../session';

export type WithActive<T extends SessionMetadataOptions> = T & {
  requireActive?: boolean;
};
