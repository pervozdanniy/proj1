/* eslint-disable */

export const protobufPackage = "skopa.common";

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
  phone?: string | undefined;
  email_verified_at?: string | undefined;
}

export const SKOPA_COMMON_PACKAGE_NAME = "skopa.common";
