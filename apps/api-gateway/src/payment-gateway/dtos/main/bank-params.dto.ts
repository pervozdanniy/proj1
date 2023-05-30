import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BankParamsDto {
  @ApiProperty({ example: 'BANCO_CHILE' })
  @IsString()
  @IsOptional()
  bank_code: string;

  @ApiProperty({ example: '3563' })
  @IsString()
  @IsOptional()
  bank_agency_code: string;

  @ApiProperty({ example: 'Bank Test' })
  @IsString()
  @IsNotEmpty()
  bank_account_name: string;

  @ApiProperty({ example: '123456890' })
  @IsString()
  @IsNotEmpty()
  bank_account_number: string;

  @ApiProperty({ example: '021000021' })
  @IsString()
  @IsOptional()
  routing_number: string;
}
