import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MakeDepositDto {
  @ApiProperty({ example: '1000' })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  funds_transfer_method_id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  cvv: string;
}
