export const countriesData = {
  US: { code: 'USA', currency_type: 'USD' },
  CL: { code: 'CHL', currency_type: 'CLP' },
  MX: { code: 'MEX', currency_type: 'MXN' },
  CO: { code: 'COL', currency_type: 'COP' },
  PE: { code: 'PER', currency_type: 'PEN' },
};

export type CountryData = {
  [code: string]: {
    code: string;
    currency_type: string;
  };
};
