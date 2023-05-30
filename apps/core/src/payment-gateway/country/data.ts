export const countriesData: CountryData = {
  US: { code: 'USA', currency_type: 'USD', dial_code: '+1' },
  CL: { code: 'CHL', currency_type: 'CLP', dial_code: '+56' },
  MX: { code: 'MEX', currency_type: 'MXN', dial_code: '+52' },
  CO: { code: 'COL', currency_type: 'COP', dial_code: '+57' },
  PE: { code: 'PER', currency_type: 'PEN', dial_code: '+51' },
  BR: { code: 'BRA', currency_type: 'BRL', dial_code: '+55' },
  AR: { code: 'ARG', currency_type: 'ARS', dial_code: '+54' },
};
export type CurrencyCode = string;

export const currenciesData: CurrencyCode[] = ['CLP', 'MXN', 'COP', 'PEN', 'BRL', 'ARS', 'USD', 'EUR'];

export type CountryData = {
  [code: string]: {
    code: string;
    currency_type: string;
    dial_code: string;
  };
};

export type ConvertedRates = {
  [currency: string]: {
    amount: number;
    rate: number;
  };
};

export type LiquidoFee = {
  [code: string]: {
    feeUsd: number;
    feePercents: number;
    currency_type: string;
  };
};

export const liquidoFees: LiquidoFee = {
  MX: { feeUsd: 3.5, feePercents: 0, currency_type: 'USD' },
  BR: { feeUsd: 0.05, feePercents: 3.1, currency_type: 'USD' },
};

export type PayoutType = {
  [code: string]: {
    type: string;
  };
};

export const liquidoPayoutTypes: PayoutType = {
  CL: { type: 'transfer' },
  MX: { type: 'spei' },
  BR: { type: 'transfer' },
};
