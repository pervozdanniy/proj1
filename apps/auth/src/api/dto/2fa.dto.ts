import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { TwoFactorMethod } from '../../entities/2fa_settings.entity';

export class BaseSettingsDto {
  @IsNotEmpty()
  @IsEnum(TwoFactorMethod)
  method: TwoFactorMethod;

  @IsOptional()
  @IsString()
  destination: string;
}

export class EmailSettingsDto extends BaseSettingsDto {
  @IsNotEmpty()
  @IsEmail()
  destination: string;
}

export class SmsSettingsDto extends BaseSettingsDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  destination: string;
}
