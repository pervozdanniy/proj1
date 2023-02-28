export type BalanceAttributes = {
  settled: string;
  'currency-type': string;
};

export type SendFundsResponse = {
  uuid: string;
  status: string;
  created_at: string;
};

export type USDtoAssetResponse = {
  fee_amount: string;
  unit_count: string;
};

export type AssetToUSDResponse = {
  total_amount: string;
  fee_amount: string;
  unit_count: string;
};
