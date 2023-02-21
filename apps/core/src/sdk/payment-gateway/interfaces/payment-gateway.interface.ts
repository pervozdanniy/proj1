export interface PaymentGatewayInterface {
  makeWithdrawal: (request: any) => any;

  addBankAccountParams: (request: any) => any;

  getBankAccounts: (request: any) => any;

  createReference: (request: any) => any;
}
