import { SessionMetadataOptions } from '../../../index';

export type WithKYC<T extends SessionMetadataOptions> = T & { requireKYC?: boolean };
