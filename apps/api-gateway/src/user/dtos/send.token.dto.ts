import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
