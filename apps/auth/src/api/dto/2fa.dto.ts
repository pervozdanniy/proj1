import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
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

  @IsOptional()
  @IsString()
  destination?: string;
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

export class EnableRequestDto implements TwoFactorEnableRequest {
  @IsNotEmpty()
  @Type((opts) => opts.newObject, {
    discriminator: {
      property: 'method',
      subTypes: [
        { name: TwoFactorMethod.Email, value: EmailSettingsDto },
        { name: TwoFactorMethod.Sms, value: SmsSettingsDto },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  @ValidateNested()
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
