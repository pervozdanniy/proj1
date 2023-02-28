import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BankParamsDto {
  @ApiProperty({ example: 'BANCO_CHILE' })
  @IsString()
  @IsOptional()
  bank_code: string;

  @ApiProperty({ example: 'Test Test' })
  @IsString()
  @IsNotEmpty()
  bank_account_name: string;

  @ApiProperty({ example: '123456890' })
  @IsString()
  @IsNotEmpty()
  bank_account_number: string;

  @ApiProperty({ example: '021000021' })
  @IsString()
  @IsNotEmpty()
  routing_number: string;
}
