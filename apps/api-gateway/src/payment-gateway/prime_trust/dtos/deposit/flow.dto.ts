import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsNumberString, IsString, Length, ValidateIf } from 'class-validator';
import { TransferInfoDto } from '../../utils/prime-trust-response.dto';

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
  @ValidateIf((obj: PayWithBankRequestDto) => !obj.customerId)
  bankId?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @ValidateIf((obj: PayWithBankRequestDto) => !obj.bankId)
  customerId?: string;

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

class LinkTransferDto {
  @ApiPropertyOptional({ example: '7cf894ac0-9e0c-806b-8b76-74d5ba51b6b' })
  paymentId?: string;

  @ApiPropertyOptional({ example: 'AUTHORIZED' })
  paymentStatus?: string;

  @ApiPropertyOptional({ example: 'key' })
  sessionKey?: string;
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

  @Type(() => TransferInfoDto)
  @ApiProperty({ type: TransferInfoDto })
  info: TransferInfoDto;
}

class SelectBankDto {
  @ApiProperty({ type: BankParamsDto, isArray: true })
  @Type(() => BankParamsDto)
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

  @ApiPropertyOptional({ type: LinkTransferDto })
  link_transfer?: LinkTransferDto;
}
