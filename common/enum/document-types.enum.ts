export enum DocumentTypesEnum {
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  GOVERNMENT_ID = 'government_id',
  RESIDENCE_PERMIT = 'residence_permit',
  UTILITY_BILL = 'utility_bill',
  OTHER = 'other',
}

export enum WithdrawalTypes {
  WIRE = 'wire',

  ACH = 'ach',

  CHECK = 'check',
}

export enum DepositTypes {
  WIRE = 'wire',

  ACH = 'ach',
}

export enum AchCheckType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
}

export enum BankAccountTypes {
  CHECKING = 'checking',
  SAVINGS = 'savings',
}

export enum WalletFor {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}
