import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateRequest } from '~common/grpc/interfaces/core';

export class CreateRequestDto implements CreateRequest {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
