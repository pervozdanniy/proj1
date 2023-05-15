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

type BillingAddress = {
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
};

type Payer = {
  name: string;
  email: string;
  billingAddress: BillingAddress;
};

type PayCashDetails = {
  referenceNumber: string;
  expirationDate: string;
  recurring: boolean;
  paymentTime: string;
};

type TransferDetails = {
  payCash: PayCashDetails;
};

type ChargeDetails = {
  transferStatusCode: number;
  transferErrorMsg: string | null;
  idempotencyKey: string;
  referenceId: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  country: string;
  finalAmount: number;
  finalCurrency: string;
  createTime: string;
  scheduledTime: string;
  finalStatusTime: string;
  payer: Payer;
  transferStatus: string;
  description: string;
  callbackUrl: string;
  transferDetails: TransferDetails;
};

type EventData = {
  chargeDetails: ChargeDetails;
};

export type EventPayload = {
  eventType: string;
  data: EventData;
};
