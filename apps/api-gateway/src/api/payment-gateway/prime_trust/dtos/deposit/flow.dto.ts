import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';

export enum PaymentType {
  BankTransfer = 'bank-transfer',
  CreditCard = 'credit-card',
  Cash = 'cash',
}

export class StartDepositFlowDto {
  @IsNumberString()
  @IsNotEmpty()
  @ApiProperty()
  amount: string;

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

export class PayWithCardRequestDto extends PayWithResourceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  cardId: number;

  @ApiProperty({ maxLength: 4, minLength: 3 })
  @IsNotEmpty()
  @Length(3, 4)
  cvv: string;
}

class BankParamsDto {
  @ApiProperty({ example: 'Test Test' })
  bank_account_name: string;

  @ApiProperty({ example: '123456890' })
  bank_account_number: string;

  @ApiPropertyOptional({ example: '021000021' })
  routing_number?: string;
}

class RedirectDto {
  @ApiProperty()
  url: string;
}

class SelectBankDto {
  @ApiProperty({ type: BankParamsDto, isArray: true })
  banks: BankParamsDto[];
}

export class DepositStartResponseDto {
  @ApiProperty()
  flowId: number;

  @ApiProperty({ enum: ['select-bank', 'redirect'] })
  action: string;

  @ApiPropertyOptional({ type: SelectBankDto })
  select?: SelectBankDto;

  @ApiPropertyOptional({ type: RedirectDto })
  redirect?: RedirectDto;
}
