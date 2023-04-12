import { SessionInterface, SessionMetadataOptions } from '~common/session';
import { User } from '../../../grpc/interfaces/common';

export type RegisterSessionData = {
  email: string;
  phone: string;
  password?: string;
  source?: string;
};

export type AgreementSessionData = {
  id: string;
  status: boolean;
};

export type UserDetailsSessionData = {
  user_details: {
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
  agreement: AgreementSessionData;
};

export interface RegisterSessionInterface extends SessionInterface {
  user?: never | User;
  register: RegisterSessionData;
}

export interface AgreementSessionInterface extends RegisterSessionInterface {
  user_data: UserDetailsSessionData;
}

export type WithRegistration<T extends SessionMetadataOptions> = T & { requireRegistration?: boolean };
