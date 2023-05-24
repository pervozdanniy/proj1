import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendAmountDto {
  @ApiProperty({ example: '100' })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency: string;
}
