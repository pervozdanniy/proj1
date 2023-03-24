import { SessionMetadataOptions } from '../../../session';

export type WithKYC<T extends SessionMetadataOptions> = T & { requireKYC?: boolean };
