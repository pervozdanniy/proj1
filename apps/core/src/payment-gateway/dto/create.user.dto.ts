import { IsEmail, IsObject, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserAttributes {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
export class CreateUserData {
  @IsString()
  type: string;

  @Type(() => CreateUserAttributes)
  attributes: CreateUserAttributes;
}

export class CreateUserDto {
  user_id: number;
  @IsObject()
  @Type(() => CreateUserData)
  data: CreateUserData;
}
