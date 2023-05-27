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

export type LiquidoPayoutWebhookType = {
  statusCode: number;
  errorMsg: string;
  transactionId: string;
  idempotencyKey: string;
  referenceNumber: string;
  targetName: string;
  targetDocument: string;
  targetBankName: string;
  targetBankCode: string;
  targetBankBranchId: string;
  targetBankAccountId: string;
  amount: string;
  amountInCents: number;
  currency: string;
  paidAmount: number;
  paidCurrency: string;
  exchangeRate: number;
  paidTax: number;
  createTime: string;
  finalStatusTime: string;
  transferStatus: string;
  transferStatusCode: number;
  transferErrorMsg: string;
};

export type LinkWebhookType = {
  id: string;
  creationTime: string;
  eventType: string;
  metadata: {
    resourceId: string;
    resourceType: string;
  };
};

export type FacilitaWebhookType = {
  notification: {
    type: string;
    transaction_id: string;
    secret: string;
  };
};
