import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { DepositTypes } from '~common/enum/document-types.enum';

export class DepositParamsDto {
  @ApiProperty({ example: 1 })
  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  bank_account_id: number;

  @ApiProperty({ enum: Object.values(DepositTypes) })
  @IsEnum(DepositTypes)
  @Type(() => String)
  readonly funds_transfer_type: DepositTypes;
}
