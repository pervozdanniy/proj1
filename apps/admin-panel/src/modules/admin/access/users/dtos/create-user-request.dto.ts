import { passwordRegex } from '@/constants/regex/password.regex';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsAlphanumeric, IsArray, IsInt, IsNotEmpty, Length, Matches, MaxLength } from 'class-validator';

export class CreateUserRequestDto {
  @IsNotEmpty()
  @IsAlphanumeric()
  @ApiProperty({
    example: 'jdoe',
  })
  username: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: 'John',
  })
  firstName: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: 'Doe',
  })
  lastName: string;

  @Matches(passwordRegex, { message: 'Password too weak' })
  @IsNotEmpty()
  @Length(6, 20)
  @ApiProperty({
    example: 'berg1!lo',
  })
  password: string;

  @ApiProperty({ example: [1, 2] })
  @IsArray()
  @IsInt({ each: true })
  permissions: number[];

  @ApiProperty({ example: [1, 2] })
  @ArrayNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  roles: number[];
}
