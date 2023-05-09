import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VeriffHookDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  attemptId: string;

  @ApiProperty()
  @IsString()
  action: string;
}
