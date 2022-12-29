import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class WithdrawalMakeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  funds_transfer_method_id: string;

  @ApiProperty({ example: '500' })
  @IsString()
  @IsNotEmpty()
  amount: string;
}
