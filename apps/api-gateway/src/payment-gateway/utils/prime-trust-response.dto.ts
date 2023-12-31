import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { SuccessResponse, UserAgreement } from '~common/grpc/interfaces/common';
import {
  AccountResponse,
  BalanceResponse,
  BankAccountParams,
  BankAccountsResponse,
  ContactResponse,
  Conversion,
  CreditCard,
  CreditCardResourceResponse,
  CreditCardsResponse,
  DepositResponse,
  ExchangeResponse,
  Transaction,
  TransactionParty,
  TransactionResponse,
  TransferFunds,
  TransferFundsResponse,
  TransferInfo,
} from '~common/grpc/interfaces/payment-gateway';

export class ContactResponseDto implements ContactResponse {
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

export class AgreementResponseDto implements UserAgreement {
  @ApiProperty({ description: 'HTML page to be shown' })
  content: string;

  @Exclude()
  id: string;
}

export class AccountResponseDto implements AccountResponse {
  @ApiProperty()
  name: string;

  @ApiProperty()
  number: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  uuid: string;
}

class ConversionDto implements Conversion {
  @ApiProperty()
  currency: string;

  @ApiProperty()
  amount: number;

  @ApiPropertyOptional()
  rate?: number;
}

export class BalanceResponseDto implements BalanceResponse {
  @ApiProperty()
  currency_type: string;

  @ApiProperty()
  settled: number;

  @ApiProperty({ type: ConversionDto })
  @Type(() => ConversionDto)
  conversions: Conversion[];
}

export class ExchangeResponseDto implements ExchangeResponse {
  @ApiProperty()
  currency_type: string;

  @ApiProperty({ type: ConversionDto })
  @Type(() => ConversionDto)
  conversions: Conversion[];
}

export class BankAccountParamsDto implements BankAccountParams {
  @ApiProperty()
  bank_account_name: string;
  @ApiProperty()
  bank_account_number: string;
  @ApiProperty()
  id: number;
  @ApiProperty()
  routing_number: string;
}

export class BankAccountResponseDto implements BankAccountsResponse {
  @ApiProperty({ type: BankAccountParamsDto, isArray: true })
  @Type(() => BankAccountParamsDto)
  data: BankAccountParamsDto[];
}

export class DepositResponseDto implements DepositResponse {
  @ApiProperty()
  transfer_method_id: string;
}

export class CreditCardResourceResponseDto implements CreditCardResourceResponse {
  @ApiProperty()
  redirect_url: string;
}

export class SuccessResponseDto implements SuccessResponse {
  @ApiProperty()
  success: boolean;
}

export class CreditCardDto implements CreditCard {
  @ApiProperty()
  id: number;

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

export class CreditCardsResponseDto implements CreditCardsResponse {
  @ApiProperty({ type: CreditCardDto, isArray: true })
  @Type(() => CreditCardDto)
  data: CreditCard[];
}

export class FundsDto implements TransferFunds {
  @ApiProperty()
  amount: number;
  @ApiProperty()
  created_at: string;
  @ApiProperty()
  currency_type: string;
  @ApiProperty()
  status: string;
}

export class TransferFundsResponseDto implements TransferFundsResponse {
  @ApiProperty({ type: FundsDto })
  data: FundsDto | undefined;
}

class TransactionPartyDto implements TransactionParty {
  @ApiPropertyOptional()
  first_name?: string;
  @ApiPropertyOptional()
  last_name?: string;
  @ApiPropertyOptional()
  avatar?: string;
}

export class TransactionDto implements Transaction {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  amount: number;
  @ApiProperty()
  created_at: string;
  @ApiProperty()
  fee: number;
  @ApiProperty()
  status: string;
  @ApiProperty()
  title: string;
  @ApiPropertyOptional({ type: TransactionPartyDto })
  @Type(() => TransactionPartyDto)
  recepient?: TransactionPartyDto;
}
export class TransactionResponseDto implements TransactionResponse {
  @ApiProperty()
  has_more: boolean;
  @ApiProperty()
  last_id: number | undefined;
  @ApiProperty({ type: TransactionDto })
  @Type(() => TransactionDto)
  transactions: TransactionDto[];
}
export class TransferInfoDto {
  @ApiProperty()
  fee: number;

  @ApiProperty({ type: ConversionDto })
  @Type(() => ConversionDto)
  conversion: ConversionDto;
}

export class BankTransferInfoDto implements TransferInfo {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  fee: number;

  @ApiProperty({ required: false })
  rate?: number;
}
