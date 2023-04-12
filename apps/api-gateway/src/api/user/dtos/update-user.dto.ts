import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsISO31661Alpha2,
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
  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsPhoneNumber(undefined, { each: true })
  new: string[];

  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsPhoneNumber(undefined, { each: true })
  removed: string[];
}

export class UserDetails {
  @ApiProperty({ example: 'first_name' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  first_name: string;

  @ApiProperty({ example: 'last_name' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  last_name: string;

  @ApiProperty({ example: 'Las Vegas' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  city: string;

  @ApiProperty({ example: 'NV' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({ format: 'date', example: '1995-09-09' })
  @IsString()
  @IsNotEmpty()
  date_of_birth: string;

  @ApiProperty({ example: '123 MK Road' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  street: string;

  @ApiProperty({ example: 89145 })
  @IsNumber()
  @IsNotEmpty()
  postal_code: number;

  @ApiProperty({ example: '12' })
  @IsNotEmpty()
  @Length(1, 50)
  apartment: string;

  @ApiProperty({ example: 123123123 })
  @IsNumber()
  @IsNotEmpty()
  tax_id_number: number;

  @ApiProperty({ enum: Object.values(SendType), default: SendType.SEND_TYPE_UNSPECIFIED })
  @IsEnum(SendType)
  @Type(() => Number)
  send_type?: SendType;
}

export class UpdateUserDto implements UpdateRequest {
  id: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsISO31661Alpha2()
  @IsOptional()
  country_code?: string;

  @ApiPropertyOptional({ type: UserDetails })
  @ValidateNested()
  @IsOptional()
  @Type(() => UserDetails)
  details?: UserDetails;

  @ApiPropertyOptional({ type: UserContactsDto })
  @ValidateNested()
  @IsOptional()
  @Type(() => UserContactsDto)
  contacts?: UserContacts;
}
