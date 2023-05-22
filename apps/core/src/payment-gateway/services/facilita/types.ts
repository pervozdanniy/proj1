export class FacilitaBankAccount {
  routing_number: string | null;
  pix_info: string | null;
  owner_name: string;
  owner_document_number: string;
  owner_company: {
    social_name: string;
    id: string;
    document_type: string;
    document_number: string;
  };
  nickname: string | null;
  internal: boolean;
  intermediary_bank_account_id: string | null;
  id: string;
  iban: string | null;
  currency: string;
  branch_number: string | null;
  branch_country: string | null;
  bank: {
    swift: string | null;
    name: string;
    id: string;
    code: string;
  };
  account_type: string;
  account_number: string | null;
  aba: string | null;
}
