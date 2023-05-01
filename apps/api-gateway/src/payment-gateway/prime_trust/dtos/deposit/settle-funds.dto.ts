import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SettleFundsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contribution_id: string;
}
