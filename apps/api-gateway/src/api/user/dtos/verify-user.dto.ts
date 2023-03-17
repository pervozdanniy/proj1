import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class VerifyUserDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  socure_verify: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  document_uuid: string;
}
