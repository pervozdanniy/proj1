/* eslint-disable */

export const protobufPackage = "skopa.common";

export interface User {
  id: number;
  email: string;
  password?: string | undefined;
  status?: string | undefined;
  created_at: string;
  updated_at: string;
  phone?: string | undefined;
  email_verified_at?: string | undefined;
  source?: string | undefined;
  details?: UserDetails | undefined;
  contacts: User[];
  agreement?: UserAgreement | undefined;
  country_code?: string | undefined;
  social_id?: string | undefined;
}

export interface UserAgreement {
  id: string;
  content: string;
  status?: boolean | undefined;
}

export interface UserDetails {
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
  apartment?: string | undefined;
}

export interface IdRequest {
  id: number;
}

export interface SuccessResponse {
  success: boolean;
  error?: string | undefined;
}

export const SKOPA_COMMON_PACKAGE_NAME = "skopa.common";
