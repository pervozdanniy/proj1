import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { DepositTypes } from '~common/enum/document-types.enum';

export class CreateReferenceDto {
  @ApiProperty({ enum: Object.values(DepositTypes) })
  @IsEnum(DepositTypes)
  @Type(() => String)
  readonly type: DepositTypes;

  @ApiProperty({ example: '1000' })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency_type: string;
}

export class AttributesData {
  @ApiProperty({ example: '1000' })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency_type: string;

  @ApiProperty({ example: 'wire' })
  @IsString()
  @IsNotEmpty()
  funds_transfer_type: string;
}
export class DepositFundsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transfer_reference_id: string;

  @ApiProperty({ type: AttributesData, required: true })
  @ValidateNested()
  @Type(() => AttributesData)
  data: AttributesData;
}
