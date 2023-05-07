export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  token_type: string;
  skope: string;
}

export interface CreateEntityResponse {
  entityId: string;
}

export interface CreateWalletResponse {
  entityId: string;
  walletId: string;
  walletStatus: string;
}

export interface AvailablePaymentMethod {
  country: string;
  currency: string;
  directUsage: boolean;
  direction: 'in' | 'out';
  fields: Array<{
    description: string;
    fieldType: 'input' | 'select';
    isUserField: boolean;
    mandatory: boolean;
    name: string;
    regex: string;
    validOptions: string[];
  }>;
  imageURL: string | null;
  paymentMethodType: string;
  paymentMethodTypeClass: string;
  paymentMethodTypeDescription: string;
  paymentMethodTypeStatus: 'available' | 'unavailable';
  protected: boolean;
  storable: boolean;
  usage: string | null;
}

export type GetAvailablePaymentMethodsResponse = Array<AvailablePaymentMethod>;

export interface CreatePaymentMethodResponse {
  paymentMethodId: string;
}

export interface CreateCardResponse {
  cardIdentifier: string;
  entityId: string;
  status: string;
  issueDate: string;
  type: string;
  productId: string;
  brand: string;
  currency: string;
  paymentMethodReference: string;
}
