import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { CreateRequest } from '~common/grpc/interfaces/core';
import { Type } from 'class-transformer';

export class UserDetails {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  last_name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  city: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  street: string;

  @IsString()
  @IsNotEmpty()
  date_of_birth: string;

  @IsNumber()
  @IsOptional()
  postal_code: number;

  @IsNumber()
  @IsNotEmpty()
  tax_id_number: number;
}

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

  @IsNotEmpty()
  @IsNumber()
  country_id;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => UserDetails)
  details: UserDetails;
}
