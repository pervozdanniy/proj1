export const webhookData: string[] = [
  'accounts',
  'kyc_document_checks',
  'cip_checks',
  'contributions',
  'funds_transfers',
  'disbursements',
  'aml-checks',
  'account-cash-transfers',
  'contacts',
  'contingent_holds',
  'disbursement_authorizations',
  'funds_transfers',
  'asset_transfers',
  'trades',
  'facilitated_trades',
];

export type BalanceAttributes = {
  settled: number;
  currency_type: string;
  hot_balance: number;
  cold_balance: number;
};

export type SendFundsResponse = {
  uuid: string;
  status: string;
  created_at: string;
};

export type UsDtoAssetResponse = {
  fee_amount: number;
  unit_count: number;
};

export type AssetToUSDResponse = {
  total_amount: number;
  fee_amount: number;
  unit_count: number;

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
