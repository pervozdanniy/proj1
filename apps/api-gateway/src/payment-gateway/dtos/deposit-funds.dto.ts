import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

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
  token: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transfer_reference_id: string;

  @ApiProperty({ type: AttributesData, required: true })
  @ValidateNested()
  @Type(() => AttributesData)
  data: AttributesData;
}
