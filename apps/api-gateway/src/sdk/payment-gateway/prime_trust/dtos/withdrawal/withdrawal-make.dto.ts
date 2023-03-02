import { ApiProperty } from '@nestjs/swagger';
import {IsEnum, IsNotEmpty, IsNumber, IsString, Min} from 'class-validator';
import {WithdrawalTypes} from "~common/enum/document-types.enum";
import {Type} from "class-transformer";

export class WithdrawalMakeDto {
  @ApiProperty({ example: 1 })
  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  bank_account_id: number;

  @ApiProperty({ enum: Object.values(WithdrawalTypes) })
  @IsEnum(WithdrawalTypes)
  @Type(() => String)
  readonly funds_transfer_type: WithdrawalTypes;

  @ApiProperty({ example: '500' })
  @IsString()
  @IsNotEmpty()
  amount: string;
}
