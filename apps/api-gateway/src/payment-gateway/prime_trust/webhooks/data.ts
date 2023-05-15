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

export type FacilitaWebhookType = {
  orderId: string;
};
