export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  token_type: string;
  skope: string;
}

type PaymentMethodDirection = 'in' | 'out';
type PaymentMethodTypeClass = 'card' | 'bank' | 'digitalWallet' | 'emoney' | 'cash';
type PaymentMethodTypeStatus = 'available' | 'unavailable';

export type GetPaymentMethodsRequest = {
  country?: string;
  currency?: string;
  direction?: PaymentMethodDirection;
  paymentMethodTypeClass?: PaymentMethodTypeClass;
  paymentMethodTypeStatus?: PaymentMethodTypeStatus;
};

type ImageUrl = string;
type PaymentMethod = {
  country: string;
  currency: string;
  direction: PaymentMethodDirection;
  fields: Array<{
    name: string;
    description: string;
    regex: string;
    mandatory: boolean;
    isUserField: boolean;
    fieldType: 'input' | 'select';
    validOptions: string[];
  }>;
  imageURL: ImageUrl | null;
  paymentMethodType: string;
  paymentMethodTypeClass: PaymentMethodTypeClass;
  paymentMethodTypeStatus: PaymentMethodTypeStatus;
  paymentMethodTypeDescription: string;
  usage: ImageUrl;
};

export type GetPaymentMethodsResponse = Array<PaymentMethod>;

export type CreateEntityResponse = {
  entityId: string;
  [key: string]: any;
};

export type CreateWalletResponse = {
  entityId: string;
  walletId: string;
  walletStatus: string;
  [key: string]: any;
};

export type CreatePaymentMethodRequest = {
  walletId: string;
  paymentMethodAlias?: string;
  paymentMethodType: PaymentMethod['paymentMethodType'];
  /** @see PaymentMethod.fields */
  paymentMethodData?: Record<string, string>;
};

export type CreatePaymentMethodResponse = {
  paymentMethodId: string;
  [key: string]: any;
};

export type CreateCardResponse = {
  cardIdentifier: string;
  entityId: string;
  status: string;
  issueDate: string;
  type: string;
  productId: string;
  brand: string;
  currency: string;
  paymentMethodReference: string;
  [key: string]: any;
};

export type TransactionRequest = {
  country: string;
  amount: number;
  currency: string;
  paymentMethod: {
    type: string;
    data: Record<string, string>;
  };
};

export type TransactionResponse = {
  type: 'withdrawal' | string;
  amount: number;
  currency: string;
  transactionStatus:
    | 'initial'
    | 'finished'
    | 'error'
    | 'conciliate'
    | 'reverted'
    | 'reserved'
    | 'cancelled'
    | 'secondStepInitial'
    | 'pending'
    | 'pendingExpired'
    | 'ongoingExpired'
    | 'pendingRejected'
    | 'conciliateReversal'
    | 'waiting'
    | 'reverting'
    | 'processingPayment';
  transactionReference: string;
  requiredAction: {
    actionType: 'paymentcode' | string;
    data: {
      additionalInformation: Array<{
        key: string;
        value: string;
      }>;
      code: string;
    };
    expirationDate: string;
    relatedPaymentMethodData: {
      paymentMethodType: string;
      paymentMethodTypeClass: string;
      paymentMethodTypeCountry: string;
      paymentMethodTypeDescription: string;
    };
    status: 'active' | 'confirmed' | 'cancelled' | 'expired';
  };
  [key: string]: any;
};
