import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, Matches, MaxLength } from 'class-validator';

const slugRegex = /^[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*$/;

export class CreateRoleRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(slugRegex)
  @MaxLength(60)
  slug: string;

  @ApiProperty({ example: [1, 2] })
  @ArrayNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  permissions: number[];
}
