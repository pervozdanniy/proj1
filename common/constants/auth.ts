export enum TwoFactorMethod {
  //  Sms = 'sms',
  Email = 'email',
}

export interface TwoFactorConstraint {
  method: TwoFactorMethod;
  code: number;
  destination?: string;
}
