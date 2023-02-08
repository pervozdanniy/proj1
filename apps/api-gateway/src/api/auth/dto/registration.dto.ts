import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
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

export class RegistrationStartRequestDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  @ApiProperty()
  phone: string;
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

  @ApiPropertyOptional({ enum: Object.values(SendType) })
  @IsEnum(SendType)
  @Type(() => Number)
  send_type?: SendType;
}

export class RegistrationFinishRequestDto {
  @ApiProperty({ example: 'test_user' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 200)
  username: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 200)
  password: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  country_id: number;

  @ApiPropertyOptional({ type: UserDetails })
  @ValidateNested()
  @IsOptional()
  @Type(() => UserDetails)
  details?: UserDetails;

  @ApiPropertyOptional({ type: 'string', isArray: true })
  @IsOptional()
  @IsArray()
  @IsPhoneNumber(undefined, { each: true })
  contacts: string[];
}
