import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SettleWithdrawDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  funds_transfer_id: string;
}
