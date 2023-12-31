import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { SendType, UserSourceEnum } from '~common/constants/user';
import { CreateRequest, UpdateContactsRequest, UpdateRequest, UserContacts } from '~common/grpc/interfaces/core';

export class UserDetailsDto {
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  last_name?: string;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  city?: string;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  street?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  date_of_birth?: string;

  @IsNumber()
  @IsOptional()
  postal_code?: number;

  @IsNumber()
  @IsOptional()
  tax_id_number?: number;

  @IsEnum(SendType)
  @IsOptional()
  @Type(() => Number)
  send_type?: SendType;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  apartment?: string;
}

export class CreateRequestDto implements CreateRequest {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsNotEmpty()
  @IsISO31661Alpha2()
  country_code: string;

  @IsOptional()
  source?: UserSourceEnum;

  @IsOptional()
  social_id?: string;

  @ValidateNested()
  @Type(() => UserDetailsDto)
  @IsOptional()
  details?: UserDetailsDto;

  @IsOptional()
  @IsArray()
  @IsPhoneNumber(undefined, { each: true })
  contacts: string[];
}

export class ContactsDto implements UserContacts {
  @IsArray()
  @IsPhoneNumber(undefined, { each: true })
  phones: string[];
}

export class UpdateRequestDto implements UpdateRequest {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  country_code?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @ValidateNested()
  @Type(() => UserDetailsDto)
  @IsOptional()
  details?: UserDetailsDto;

  @ValidateNested()
  @Type(() => ContactsDto)
  @IsOptional()
  contacts?: UserContacts;
}

export class UpdateContactsRequestDto implements UpdateContactsRequest {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ContactsDto)
  contacts: UserContacts;
}
