import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, Matches, MaxLength } from 'class-validator';

const slugRegex = /^[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*$/;

export class CreatePermissionRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @Matches(slugRegex)
  @MaxLength(60)
  slug: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(3, 160)
  description: string;
}
