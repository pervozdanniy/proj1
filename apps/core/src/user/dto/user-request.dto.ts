import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
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

  @IsEnum(SendType)
  @Type(() => String)
  send_type?: SendType;
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
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsNumber()
  country_id?: number;

  @IsOptional()
  source: UserSourceEnum;

  @ValidateNested()
  @Type(() => UserDetails)
  @IsOptional()
  details?: UserDetails;

  @IsOptional()
  @IsArray()
  @IsPhoneNumber(undefined, { each: true })
  contacts: string[];
}

export class ContactsDto implements UserContacts {
  @IsArray()
  @IsPhoneNumber(undefined, { each: true })
  new: string[];

  @IsArray()
  @IsPhoneNumber(undefined, { each: true })
  removed: string[];
}

export class UpdateRequestDto implements UpdateRequest {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsInt()
  country_id?: number;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ValidateNested()
  @Type(() => UserDetails)
  @IsOptional()
  details?: UserDetails;

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
