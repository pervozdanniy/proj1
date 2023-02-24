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
  region: string;

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
  @IsOptional()
  postal_code: number;

  @ApiProperty({ example: 123123123 })
  @IsNumber()
  @IsNotEmpty()
  tax_id_number: number;

  @ApiProperty({ enum: Object.values(SendType), default: SendType.ALL })
  @IsEnum(SendType)
  @Type(() => Number)
  send_type?: SendType;
}

export class UpdateUserDto implements UpdateRequest {
  id: number;

  @ApiPropertyOptional({ type: 'file', format: 'binary' })
  avatar: Express.Multer.File;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Length(2, 200)
  username?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  country_id?: number;

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
