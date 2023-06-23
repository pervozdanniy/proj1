import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { BankAccountParams, WithdrawFlowResponse } from '~common/grpc/interfaces/payment-gateway';

export enum PaymentType {
  BankTransfer = 'bank-transfer',
  // CreditCard = 'credit-card',
  // Cash = 'cash',
}

export class StartWithdrawFlowDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  amount: number;

  @IsString()
  @Length(3)
  @IsNotEmpty()
  @ApiProperty()
  currency: string;

  @IsNotEmpty()
  @IsEnum(PaymentType)
  @ApiProperty({ enum: Object.values(PaymentType) })
  type: PaymentType;
}

export enum TranferType {
  Wire = 'wire',
  ACH = 'ach',
}

export class PayWithResourceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  flowId: number;
}

export class PayWithBankRequestDto extends PayWithResourceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  bankId: number;

  @ApiProperty({ enum: Object.values(TranferType) })
  @IsEnum(TranferType)
  @IsNotEmpty()
  transferType: TranferType;
}

class BankParamsDto implements BankAccountParams {
  @ApiProperty()
  id: number;

  @ApiPropertyOptional({ example: 'BANCO_CHILE' })
  bank_code?: string;

  @ApiPropertyOptional({ example: '3563' })
  bank_agency_code?: string;

  @ApiProperty({ example: 'Bank Test' })
  bank_account_name: string;

  @ApiProperty({ example: '123456890' })
  bank_account_number: string;

  @ApiPropertyOptional({ example: '021000021' })
  routing_number?: string;
}

class BanksListDto {
  @ApiProperty({ type: BankParamsDto, isArray: true })
  list: BankParamsDto[];
}

export class WithdrawStartResponseDto implements WithdrawFlowResponse {
  @ApiPropertyOptional()
  flow_id?: number;

  @ApiProperty({ enum: ['select_bank', 'link_transfer', 'pay_with_bank'] })
  action: string;

  @ApiProperty({ type: BanksListDto })
  banks?: BanksListDto;
}
