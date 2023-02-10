import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
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
import { TwoFactorMethod } from '~common/constants/auth';
import { UserDetails } from '../../user/dtos/create-user.dto';

export class RegistrationStartRequestDto {
  @ApiProperty({ example: 'test453_sd@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: true, example: '+37495017680' })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 200)
  password: string;
}

export class RegistrationVerifyRequestDto {
  @ApiProperty({ enum: Object.values(TwoFactorMethod) })
  @IsNotEmpty()
  @IsEnum(TwoFactorMethod)
  method: TwoFactorMethod;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  code: number;
}

export class RegistrationFinishRequestDto {
  @ApiProperty({ example: 'test_user' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 200)
  username: string;

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
