import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, ValidateIf } from 'class-validator';
import { TransferInfoDto } from '../../utils/prime-trust-response.dto';

export enum PaymentType {
  BankTransfer = 'bank-transfer',
  CreditCard = 'credit-card',
  Cash = 'cash',
}

export class StartDepositFlowDto {
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

class RedirectDto {
  @ApiProperty()
  url: string;

  @Type(() => TransferInfoDto)
  @ApiProperty({ type: TransferInfoDto })
  info: TransferInfoDto;
}

export class BankDetailsDto {
  @ApiPropertyOptional()
  swift: string;
  @ApiPropertyOptional()
  name: string;
  @ApiPropertyOptional()
  id: string;
  @ApiPropertyOptional()
  code: string;
}
export class BankDataDto {
  @ApiPropertyOptional()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  branch_number?: string;

  @Type(() => BankDetailsDto)
  @ApiPropertyOptional({ type: BankDetailsDto })
  @IsOptional()
  details?: BankDetailsDto;

  @ApiPropertyOptional()
  @IsOptional()
  account_type?: string;

  @ApiPropertyOptional()
  account_number: string;
}

class BankCredentialsDataDto {
  @ApiProperty()
  bank: BankDataDto;

  @Type(() => TransferInfoDto)
  @ApiProperty({ type: TransferInfoDto })
  info: TransferInfoDto;
}

export class DepositStartResponseDto {
  @ApiProperty()
  flowId: number;

  @ApiProperty({ enum: ['redirect', 'link_transfer', 'pay_with_bank'] })
  action: string;

  @ApiPropertyOptional({ type: RedirectDto })
  redirect?: RedirectDto;

  @ApiPropertyOptional({ type: LinkTransferDto })
  link_transfer?: LinkTransferDto;

  @ApiPropertyOptional({ type: BankCredentialsDataDto })
  bank_params?: BankCredentialsDataDto;
}

export class StartWithdrawFlowRequest {
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
