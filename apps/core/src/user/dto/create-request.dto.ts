import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { CreateRequest } from '~common/grpc/interfaces/core';
import { UserSourceEnum } from '../constants/user';

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
  region: string;

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
  email: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsNumber()
  country_id: number;

  @IsOptional()
  source: UserSourceEnum;

  @ValidateNested()
  @Type(() => UserDetails)
  @IsOptional()
  details?: UserDetails;
}
