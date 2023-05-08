/* eslint-disable */

export const protobufPackage = "skopa.veriff";

export interface Person {
  gender?: string | undefined;
  idNumber?: string | undefined;
  lastName: string;
  firstName: string;
  citizenship?: string | undefined;
  dateOfBirth?: string | undefined;
  nationality?: string | undefined;
  yearOfBirth?: string | undefined;
  placeOfBirth?: string | undefined;
  pepSanctionMatch?: boolean | undefined;
}

export interface Document {
  type: string;
  number: string;
  country: string;
  validFrom?: string | undefined;
  validUntil?: string | undefined;
}

export interface Verification {
  id: string;
  code: number;
  person?: Person | undefined;
  reason?: string | undefined;
  status: string;
  comments: string[];
  document: Document | undefined;
  reasonCode?: string | undefined;
  vendorData: string;
  decisionTime: string;
  acceptanceTime: string;
  additionalVerifiedData: { [key: string]: string };
}

export interface Verification_AdditionalVerifiedDataEntry {
  key: string;
  value: string;
}

export interface TechnicalData {
  ip: string;
}

export interface WebhookResponse {
  status: string;
  verification: Verification | undefined;
  technicalData: TechnicalData | undefined;
}

export interface VeriffHookRequest {
  id: string;
  attemptId: string;
  action: string;
}

export interface VeriffSessionResponse {
  status: string;
  verification: VeriffSessionVerification | undefined;
}

export interface VeriffSessionVerification {
  id: string;
  url: string;
  vendorData: string;
  host: string;
  status: string;
  sessionToken: string;
}

export interface VeriffSessionRequest {
  user_id: number;
  type: string;
}

export const SKOPA_VERIFF_PACKAGE_NAME = "skopa.veriff";
