export type BalanceAttributes = {
  settled: string;
  currency_type: string;
  hot_balance: string;
  cold_balance: string;
};

export type SendFundsResponse = {
  uuid: string;
  status: string;
  created_at: string;
};

export type UsDtoAssetResponse = {
  fee_amount: string;
  unit_count: string;
};

export type AssetToUSDResponse = {
  total_amount: string;
  fee_amount: string;
  unit_count: string;

  trade_id?: string;
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

export type CardResourceType = {
  id: string;
  attributes: {
    status: string;
    'funds-transfer-method-id': string;
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

export type CreateAccountType = {
  data: {
    type: 'account';
    attributes: {
      'account-type': string;
      name: string;
      'authorized-signature': string;
      'webhook-config': {
        url: string;
      };
      owner: {
        'contact-type': 'natural_person';
        name: string;
        email: string;
        'tax-id-number': string;
        'tax-country': string;
        'date-of-birth': string;
        'primary-phone-number': {
          country: string;
          number: string;
          sms: boolean;
        };
        'primary-address': {
          'street-1': string;
          'postal-code': string;
          region?: string | null;
          city: string;
          country: string;
        };
      };
    };
  };
};

export type Media = { id: string; name: string; sessionId: string; buffer: Buffer; label: string };
