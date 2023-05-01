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
];

export type PrimeTrustWebhookType = {
  id: string;
  'account-id': string;
  action: string;
  data: { changes: string[] };
  'resource-id': string;
  'resource-type': string;
  account_id: string;
  resource_id: string;
  resource_type: string;
};

export type KoyweWebhookType = {
  eventName: string;
  orderId: string;
  timeStamp: string;
  signature: string;
};
