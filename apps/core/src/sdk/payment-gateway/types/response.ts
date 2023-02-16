export type BalanceAttributes = {
  settled: string;
  blockchain: string;
  disbursable: string;
  'pending-transfer': string;
  'currency-type': string;
  'contingent-hold': string;
  'non-contingent-hold': string;
};

export type SendFundsResponse = {
  uuid: string;
  status: string;
  created_at: string;
};

export type USDtoAssetResponse = {
  base_amount: string;
  fee_amount: string;
  total_amount: string;
  unit_count: string;
};