import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, Length } from 'class-validator';

export class UpdatePermissionRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 160)
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}
