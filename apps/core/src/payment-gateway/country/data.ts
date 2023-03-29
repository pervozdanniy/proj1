export const countriesData: CountryData = {
  US: { code: 'USA', currency_type: 'USD', dial_code: '+1' },
  CL: { code: 'CHL', currency_type: 'CLP', dial_code: '+56' },
  MX: { code: 'MEX', currency_type: 'MXN', dial_code: '+52' },
  CO: { code: 'COL', currency_type: 'COP', dial_code: '+57' },
  PE: { code: 'PER', currency_type: 'PEN', dial_code: '+51' },
};

export type CountryData = {
  [code: string]: {
    code: string;
    currency_type: string;
    dial_code: string;
  };
};
