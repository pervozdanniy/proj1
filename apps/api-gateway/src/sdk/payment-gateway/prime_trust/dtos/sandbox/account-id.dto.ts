import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AccountIdDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  account_id: string;
}
