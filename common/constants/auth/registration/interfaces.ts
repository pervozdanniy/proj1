import { SessionInterface, SessionMetadataOptions } from '~common/session';

export type PreRegisterSessionData = {
  email: string;
  phone: string;
  password: string;
};

export type PreAgreementSessionData = {
  id: string;
  status: boolean;
};

export type UserDetailsSessionData = {
  country_code: string;
  details?: {
    first_name?: string | undefined;
    last_name?: string | undefined;
    date_of_birth?: string | undefined;
    city?: string | undefined;
    street?: string | undefined;
    postal_code?: number | undefined;
    tax_id_number?: number | undefined;
    region?: string | undefined;
    send_type?: number | undefined;
    avatar?: string | undefined;
  };
};

export interface PreRegisteredSessionInterface extends SessionInterface {
  user?: never;
  register: PreRegisterSessionData;
}

export interface PreAgreementSessionInterface extends PreRegisteredSessionInterface {
  user_details: UserDetailsSessionData;
  agreement: PreAgreementSessionData;
}

export type WithPreRegistration<T extends SessionMetadataOptions> = T & { requirePreRegistration?: boolean };
