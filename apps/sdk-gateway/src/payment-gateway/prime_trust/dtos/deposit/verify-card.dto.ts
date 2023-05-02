import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCardDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contact_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transfer_method_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  resource_id: string;
}
