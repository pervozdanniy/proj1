import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class OpenAccountRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  user_id: number;
}
