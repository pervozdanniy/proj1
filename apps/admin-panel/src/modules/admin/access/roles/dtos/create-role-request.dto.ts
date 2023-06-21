import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateRoleRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: [1, 2] })
  @ArrayNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  permissions: number[];
}
