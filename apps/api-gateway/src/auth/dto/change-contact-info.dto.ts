import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { TwoFactorVerificationDto } from './2fa.request.dto';

export class ChangeEmailDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;
}

export class ChangePhoneDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  @ApiProperty()
  phone: string;
}

export class ChangeContactVerifyDto extends TwoFactorVerificationDto {}
