export type BalanceAttributes = {
  settled: string;
  'currency-type': string;
};

export type SendFundsResponse = {
  uuid: string;
  status: string;
  created_at: string;
};

export type USDtoAssetResponse = {
  fee_amount: string;
  unit_count: string;
};

export type AssetToUSDResponse = {
  total_amount: string;
  fee_amount: string;
  unit_count: string;
};

export type ContactType = {
  id: string;
  attributes: {
    'account-id': string;
    'first-name': string;
    'last-name': string;
    'middle-name': string;
    'identity-fingerprint': string;
    'proof-of-address-documents-verified': boolean;
    'identity-documents-verified': boolean;
    'aml-cleared': boolean;
    'cip-cleared': boolean;
    'identity-confirmed': boolean;
  };
};

export type AccountType = {
  id: string;
  attributes: {
    'account-id': string;
    name: string;
    number: string;
    'contributions-frozen': boolean;
    'disbursements-frozen': boolean;
    statements: boolean;
    'solid-freeze': boolean;
    'offline-cold-storage': string;
    status: string;
  };
};

export type CipCheckType = {
  id: string;
  type: string;

  attributes: {
    status: string;
  };
};

export type FileType = {
  buffer: string;
  originalname: string;
};

export type DocumentDataType = {
  id: string;
  attributes: {
    'file-url': string;
    extension: string;
    label: string;
  };
};

export type DocumentCheckType = {
  id: string;
  attributes: {
    status: string;
  };
};
