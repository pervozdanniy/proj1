import { SessionInterface, SessionMetadataOptions } from '~common/session';

export type PreRegisterSessionData = {
  email: string;
  phone: string;
};

export interface PreRegisteredSessionInterface extends SessionInterface {
  user?: never;
  register: PreRegisterSessionData;
}

export type WithPreRegistration<T extends SessionMetadataOptions> = T & { requirePreRegistration?: boolean };
