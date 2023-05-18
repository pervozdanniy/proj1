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

export type LiquidoWebhookType = {
  eventType: 'CHARGE_SUCCEEDED';
  data: {
    linkId: string;
    orderId: string;
    amount: number;
    currency: string;
    country: string;
    paymentStatus: string;
    redirectUrl: string;
    callbackUrl: string;
    finalPaymentMethod: string;
    finalStatusTimestamp: number;
    finalStatusTime: string;
    name: string;
    email: string;
    phone: string;
    documentId: string;
  };
};
