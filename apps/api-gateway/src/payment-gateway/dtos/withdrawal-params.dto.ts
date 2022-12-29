import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { WithdrawalTypes } from '~common/enum/document-types.enum';

export class WithdrawalParamsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

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

  @ApiProperty({ enum: Object.values(WithdrawalTypes) })
  @IsEnum(WithdrawalTypes)
  @Type(() => String)
  readonly funds_transfer_type: WithdrawalTypes;
}
