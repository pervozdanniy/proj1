import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { WithdrawalTypes } from '~common/enum/document-types.enum';

export class WithdrawalParamsDto {
  @ApiProperty({ example: 1 })
  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  bank_account_id: number;

  @ApiProperty({ enum: Object.values(WithdrawalTypes) })
  @IsEnum(WithdrawalTypes)
  @Type(() => String)
  readonly funds_transfer_type: WithdrawalTypes;
}
