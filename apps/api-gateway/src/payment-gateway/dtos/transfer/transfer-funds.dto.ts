import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class TransferFundsRequestDto {
  @ApiProperty({ description: 'User id', example: 6 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  receiver_id: number;

  @ApiProperty({ description: 'Amount' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency_type: string;
}
