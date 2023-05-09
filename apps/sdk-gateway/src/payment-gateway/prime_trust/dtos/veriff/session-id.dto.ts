import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SessionIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  session_id: string;
}
