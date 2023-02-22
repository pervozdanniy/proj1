import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { UserDetails } from '../../user/dtos/update-user.dto';
import { TwoFactorVerificationDto } from './2fa.request.dto';

export class RegistrationStartRequestDto {
  @ApiProperty({ example: 'test453_sd@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+37495017680' })
  @IsNotEmpty()
  // @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 200)
  password: string;
}

export class RegistrationVerifyRequestDto extends TwoFactorVerificationDto {}

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
