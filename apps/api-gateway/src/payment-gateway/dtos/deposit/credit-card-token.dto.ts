import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreditCardTokenDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  resource_id: string;
}
