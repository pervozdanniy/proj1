import Fraction from 'fraction.js';
import { facilitaTaxesBrazil } from './constants';

export const countBrazilRate = (pureRate: number) => {
  const { facilitaFeeRate, cryptoSettlementRate, brazilFederalTaxRate } = facilitaTaxesBrazil;
  const number1 = new Fraction(pureRate);
  const percentage1 = new Fraction(facilitaFeeRate).div(100);
  const percentage2 = new Fraction(cryptoSettlementRate).div(100);
  const percentage3 = new Fraction(brazilFederalTaxRate).div(100);

  const result = number1.add(number1.mul(percentage1)).add(number1.mul(percentage2)).add(number1.mul(percentage3));

  return Number(result.toString());
};
