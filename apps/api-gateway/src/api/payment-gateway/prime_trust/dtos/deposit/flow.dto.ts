import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';

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
}

export enum TranferType {
  Wire = 'wire',
  ACH = 'ach',
}

export class PayWithBankRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  flowId: number;

  @ApiProperty()
  @IsNotEmpty()
  bankId: number;

  @ApiProperty({ enum: Object.values(TranferType) })
  @IsEnum(TranferType)
  @IsNotEmpty()
  transferType: TranferType;
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

export class PayWithBankResponseDto {
  @ApiProperty()
  contribution_id: string;
}
