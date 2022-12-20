import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SendTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
