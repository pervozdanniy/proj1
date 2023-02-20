import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { SendType } from '~common/constants/user';
import { UpdateRequest, UserContacts } from '~common/grpc/interfaces/core';

export class UserContactsDto {
  @IsOptional()
  @IsArray()
  @IsPhoneNumber(undefined, { each: true })
  new: string[];

  @IsOptional()
  @IsArray()
  @IsPhoneNumber(undefined, { each: true })
  removed: string[];
}

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
  @Type(() => Number)
  send_type?: SendType;
}

export class UpdateUserDto implements UpdateRequest {
  id: number;

  @ApiPropertyOptional({ example: 'gevorg' })
  @IsString()
  @IsOptional()
  @Length(2, 200)
  username?: string;

  @ApiPropertyOptional({ required: true, example: '+37495017680' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  country_id?: number;

  @ApiProperty({ type: UserDetails })
  @ValidateNested()
  @IsOptional()
  @Type(() => UserDetails)
  details?: UserDetails;

  @ApiProperty({ type: UserContactsDto })
  @ValidateNested()
  @IsOptional()
  @Type(() => UserContactsDto)
  contacts?: UserContacts;
}
