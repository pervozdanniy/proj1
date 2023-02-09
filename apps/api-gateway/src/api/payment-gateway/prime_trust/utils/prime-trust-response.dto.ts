import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SuccessResponse } from '~common/grpc/interfaces/common';
import {
  AccountResponse,
  BalanceResponse,
  BankAccountParams,
  BankAccountsResponse,
  ContactResponse,
  ContributionResponse,
  CreditCard,
  CreditCardResourceResponse,
  CreditCardsResponse,
  DepositResponse,
  DocumentResponse,
  TransferFunds,
  TransferFundsResponse,
  Withdrawal,
  WithdrawalResponse,
  WithdrawalsDataResponse,
} from '~common/grpc/interfaces/payment-gateway';

export class ContactResponseDTO implements ContactResponse {
  @ApiProperty()
  aml_cleared: boolean;

  @ApiProperty()
  cip_cleared: boolean;

  @ApiProperty()
  first_name: string;

  @ApiProperty()
  identity_confirmed: boolean;

  @ApiProperty()
  identity_documents_verified: boolean;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  proof_of_address_documents_verified: boolean;

  @ApiProperty()
  uuid: string;
}

export class AccountResponseDTO implements AccountResponse {
  @ApiProperty()
  name: string;

  @ApiProperty()
  number: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  uuid: string;
}

export class DocumentResponseDTO implements DocumentResponse {
  @ApiProperty()
  document_id: string;
}

export class BalanceResponseDTO implements BalanceResponse {
  @ApiProperty()
  currency_type: string;
  @ApiProperty()
  settled: string;
}

export class BankAccountParamsDTO implements BankAccountParams {
  @ApiProperty()
  bank_account_name: string;
  @ApiProperty()
  bank_account_number: string;
  @ApiProperty()
  id: number;
  @ApiProperty()
  routing_number: string;
}

export class BankAccountResponseDTO implements BankAccountsResponse {
  @ApiProperty({ type: BankAccountParamsDTO, isArray: true })
  @Type(() => BankAccountParamsDTO)
  data: BankAccountParamsDTO[];
}

export class DepositResponseDTO implements DepositResponse {
  @ApiProperty()
  transfer_method_id: string;
}

export class CreditCardResourceResponseDTO implements CreditCardResourceResponse {
  @ApiProperty()
  resource_id: string;
  @ApiProperty()
  resource_token: string;
}

export class SuccessResponseDTO implements SuccessResponse {
  @ApiProperty()
  success: boolean;
}

export class CreditCardDTO implements CreditCard {
  @ApiProperty()
  created_at: string;
  @ApiProperty()
  credit_card_bin: string;
  @ApiProperty()
  credit_card_expiration_date: string;
  @ApiProperty()
  credit_card_type: string;
  @ApiProperty()
  status: string;
  @ApiProperty()
  transfer_method_id: string;
  @ApiProperty()
  updated_at: string;
  @ApiProperty()
  uuid: string;
}

export class CreditCardsResponseDTO implements CreditCardsResponse {
  @ApiProperty({ type: CreditCardDTO, isArray: true })
  @Type(() => CreditCardDTO)
  data: CreditCard[];
}

export class ContributionResponseDTO implements ContributionResponse {
  @ApiProperty()
  contribution_id: string;
}

export class TransferFundsDTO implements TransferFunds {
  @ApiProperty()
  amount: string;
  @ApiProperty()
  created_at: string;
  @ApiProperty()
  currency_type: string;
  @ApiProperty()
  status: string;
  @ApiProperty()
  uuid: string;
}

export class TransferFundsResponseDTO implements TransferFundsResponse {
  @ApiProperty({ type: TransferFundsDTO, isArray: true })
  @Type(() => TransferFundsDTO)
  data: TransferFundsDTO | undefined;
}

export class WithdrawalDTO implements Withdrawal {
  @ApiProperty()
  bank_account_name: string;
  @ApiProperty()
  bank_account_number: string;
  @ApiProperty()
  funds_transfer_type: string;
  @ApiProperty()
  routing_number: string;
  @ApiProperty()
  transfer_method_id: string;
}

export class WithdrawalsDataResponseDTO implements WithdrawalsDataResponse {
  data: WithdrawalDTO[];
}

export class WithdrawalResponseDTO implements WithdrawalResponse {
  @ApiProperty()
  transfer_method_id: string;
}
