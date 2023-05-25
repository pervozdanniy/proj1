import { facilitaTaxesBrazil } from './constants';

export const countBrazilRate = (pureRate: number) => {
  const { facilitaFeeRate, cryptoSettlementRate, brazilFederalTaxRate } = facilitaTaxesBrazil;

  const first = (pureRate * (facilitaFeeRate + cryptoSettlementRate)) / 100;
  const second = (first * brazilFederalTaxRate) / 100;
  const finalRate = first + second + pureRate;

  return finalRate;
};
