import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({ example: 'Wallet name' })
  @IsString()
  @IsNotEmpty()
  label: string;
}
