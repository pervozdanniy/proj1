import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserAttributes {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'gevor276@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}
export class CreateUserData {
  @ApiProperty({ example: 'user' })
  @IsString()
  type: string;

  @ApiProperty({ type: CreateUserAttributes, required: true })
  @ValidateNested()
  @Type(() => CreateUserAttributes)
  attributes: CreateUserAttributes;
}

export class CreateUserDto {
  @ApiProperty({ type: CreateUserData, required: true })
  @IsObject()
  @ValidateNested()
  @Type(() => CreateUserData)
  data: CreateUserData;
}
