export type ReferenceData = {
  name: string;
  account_number: string;
  tax_id: string;
  bank: string;
  email: string;
  asset_transfer_method_id?: string;
  wallet_address?: string;
  amount: string;
  currency_type: string;
};

export type KoyweCreateOrder = {
  providedAddress: string;
  orderId: string;
};

export type KoyweOrderInfo = {
  koyweFee: number;
  networkFee: number;
  orderId: string;
  status: string;
};

export type KoyweQuote = {
  quoteId: string;
};
