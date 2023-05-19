import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { ApproveAgreementRequest, CreateAgreementRequest, RegisterFinishRequest } from '~common/grpc/interfaces/auth';
import { UserDetails } from '../../user/dtos/update-user.dto';
import { TwoFactorVerificationDto } from './2fa.request.dto';

export class RegistrationStartRequestDto {
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({ example: 'test453_sd@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+37495017680' })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 200)
  password: string;
}

export class RegistrationVerifyRequestDto extends TwoFactorVerificationDto {}

export class CreateAgreementRequestDto implements CreateAgreementRequest {
  @ApiProperty({ example: 'US' })
  @IsISO31661Alpha2()
  @IsNotEmpty()
  country_code: string;

  @ApiPropertyOptional({ type: UserDetails })
  @ValidateNested()
  @IsOptional()
  @Type(() => UserDetails)
  details: UserDetails;
}

export class ChangeAgreementStatusDto implements ApproveAgreementRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class RegistrationFinishRequestDto implements RegisterFinishRequest {
  @ApiPropertyOptional({ type: 'string', isArray: true, example: '+37495017680' })
  @IsOptional()
  @IsArray()
  @IsPhoneNumber(undefined, { each: true })
  contacts: string[];
}
