import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  BankDepositInterface,
  BankInterface,
  BankWithdrawalInterface,
  CashInterface,
  CreditCardInterface,
  DepositInterface,
  PaymentGatewayInterface,
  RedirectDepositInterface,
  WireDepositInterface,
} from '../interfaces/payment-gateway.interface';
import { BrazilPaymentGateway } from './countries/brazil-payment.gateway';
import { ChilePaymentGateway } from './countries/chile-payment.gateway';
import { ColombiaPaymentGateway } from './countries/colombia-payment.gateway';
import { MexicoPaymentGateway } from './countries/mexico-payment.gateway';
import { PeruPaymentGateway } from './countries/peru-payment.gateway';
import { USPaymentGateway } from './countries/us-payment.gateway';

export const hasBank = <T extends PaymentGatewayInterface>(gateway: T): gateway is T & BankInterface =>
  gateway.getAvailablePaymentMethods().includes('bank-transfer');

export const hasCreditCard = <T extends PaymentGatewayInterface>(gateway: T): gateway is T & CreditCardInterface =>
  gateway.getAvailablePaymentMethods().includes('credit-card');

export const hasCash = <T extends PaymentGatewayInterface>(gateway: T): gateway is T & CashInterface =>
  gateway.getAvailablePaymentMethods().includes('cash');

export const hasBankDeposit = <T extends PaymentGatewayInterface>(gateway: T): gateway is T & BankDepositInterface =>
  hasBank(gateway) && hasDeposit(gateway) && 'setDepositParams' in gateway;

export const hasWireTransfer = <T extends PaymentGatewayInterface>(gateway: T): gateway is T & WireDepositInterface =>
  'createWireReference' in gateway;

export const hasRedirectDeposit = <T extends PaymentGatewayInterface>(
  gateway: T,
): gateway is T & RedirectDepositInterface => 'createRedirectReference' in gateway;

export const hasDeposit = <T extends PaymentGatewayInterface>(gateway: T): gateway is T & DepositInterface =>
  'makeDeposit' in gateway;

export const hasWithdrawal = <T extends PaymentGatewayInterface>(gateway: T): gateway is T & BankWithdrawalInterface =>
  'makeWithdrawal' in gateway;

@Injectable()
export class PaymentGatewayManager {
  constructor(private moduleRef: ModuleRef) {}

  public createApiGatewayService(type: string): PaymentGatewayInterface {
    switch (type) {
      case 'US':
        return this.moduleRef.get(USPaymentGateway);
      case 'BR':
        return this.moduleRef.get(BrazilPaymentGateway);
      case 'CL':
        return this.moduleRef.get(ChilePaymentGateway);
      case 'MX':
        return this.moduleRef.get(MexicoPaymentGateway);
      case 'CO':
        return this.moduleRef.get(ColombiaPaymentGateway);
      case 'PE':
        return this.moduleRef.get(PeruPaymentGateway);
      default:
        throw new Error(`Unsupported country: "${type}"`);
    }
  }
}
