import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BankParamsDto {
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
