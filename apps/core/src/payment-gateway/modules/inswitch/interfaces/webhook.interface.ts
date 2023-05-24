export enum TransactionType {
  Purchase = '0',
  ATM = '1',
  AdjustmentDebit = '20',
  Reversal = '21',
  AdjustmentCredit = '22',
}

export enum TransactionStatus {
  Waiting = 'WAITING',
  Approved = 'APPROVED',
  Declined = 'DECLINED',
  Reverted = 'REVERTED',
  Adjusted = 'ADJUSTED',
  Finished = 'FINISHED',
}

export type CardInfo = {
  cardIdentifier: string;
  entityId: string;
  paymentMethodReference: string;
  type: 'virtual' | 'physical';
  productId: string;
  brand: 'mastercard' | 'visa';
  expiry_mm_yyyy: string;
  last4: string;
};

export type TransactionInfo = {
  authorizationId: string;
  status: TransactionStatus;
  transactionType: TransactionType;
  amount: string;
  currency: string;
  fx_currency: 'USD';
  fx_rate: string;
  panEntryMode: string;
  mcc: string;
  merchantCountry: string;
  merchantName: string;
  acquiringCountryCode: string;
  reason: string;
};

export type AuthorizationWebhookRequest = {
  cardInfo: CardInfo;
  transactionInfo: TransactionInfo;
};

export enum AuthorizationStatus {
  Approved = 'APPROVED',
  Declined = 'DECLINED',
}

export type AutorizationWebhookResponse = {
  authorizationId: string;
  status: AuthorizationStatus;
};
