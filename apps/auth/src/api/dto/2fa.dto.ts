import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNotEmpty, Max, Min, ValidateNested } from 'class-validator';
import {
  TwoFactorCode,
  TwoFactorDisableRequest,
  TwoFactorEnableRequest,
  TwoFactorSettings,
  TwoFactorVerificationRequest,
} from '~common/grpc/interfaces/auth';
import { TwoFactorMethod } from '../../entities/2fa_settings.entity';

export class BaseSettingsDto implements TwoFactorSettings {
  @IsNotEmpty()
  @IsEnum(TwoFactorMethod)
  method: TwoFactorMethod;
}

export class EnableRequestDto implements TwoFactorEnableRequest {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => BaseSettingsDto)
  settings: BaseSettingsDto;
}

export class TwoFactorCodeDto implements TwoFactorCode {
  @IsNotEmpty()
  @IsEnum(TwoFactorMethod)
  method: TwoFactorMethod;

  @IsNotEmpty()
  @IsInt()
  @Min(100000)
  @Max(999999)
  code: number;
}

export class VerifyRequestDto implements TwoFactorVerificationRequest {
  @IsArray()
  @Type(() => TwoFactorCodeDto)
  @ValidateNested({ each: true })
  codes: TwoFactorCode[];
}

export class DisableRequestDto implements TwoFactorDisableRequest {
  @IsArray()
  @IsEnum(TwoFactorMethod, { each: true })
  methods: TwoFactorMethod[];
}

export class ResendRequestDto implements TwoFactorSettings {
  @IsNotEmpty()
  @IsEnum(TwoFactorMethod)
  method: TwoFactorMethod;
}
