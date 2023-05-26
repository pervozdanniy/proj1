import Fraction from 'fraction.js';
import { facilitaTaxesBrazil } from './constants';

export const countBrazilRate = (pureRate: number) => {
  const { facilitaFeeRate, cryptoSettlementRate, brazilFederalTaxRate } = facilitaTaxesBrazil;
  const pureRateFraction = new Fraction(pureRate);
  const facilitaFeeRateFraction = new Fraction(facilitaFeeRate).div(100);
  const cryptoSettlementRateFraction = new Fraction(cryptoSettlementRate).div(100);
  const brazilFederalTaxRateFraction = new Fraction(brazilFederalTaxRate).div(100);

  const result = pureRateFraction
    .add(pureRateFraction.mul(facilitaFeeRateFraction))
    .add(pureRateFraction.mul(cryptoSettlementRateFraction))
    .add(pureRateFraction.mul(brazilFederalTaxRateFraction));

  return Number(result.toString());
};
