import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TwoFactorMethod } from '~common/constants/auth';

export class TwoFactorVerificationDto {
  @IsNotEmpty()
  @IsEnum(TwoFactorMethod)
  @ApiProperty({ enum: Object.values(TwoFactorMethod) })
  method: TwoFactorMethod;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  code: number;
}

export class TwoFactorVerifyRequestDto {
  @IsArray()
  @IsNotEmpty()
  @Type(() => TwoFactorVerificationDto)
  @ValidateNested({ each: true })
  @ApiProperty({ type: TwoFactorVerificationDto, isArray: true })
  codes: TwoFactorVerificationDto[];
}

export class TwoFactorEnableRequestDto {
  @IsNotEmpty()
  @IsEnum(TwoFactorMethod)
  @ApiProperty({ enum: Object.values(TwoFactorMethod) })
  method: TwoFactorMethod;

  @IsOptional()
  @IsString()
  @ApiProperty()
  destination?: string;
}

export class TwoFactorDisableRequestDto {
  @IsOptional()
  @IsArray()
  @IsEnum(TwoFactorMethod, { each: true })
  @ApiPropertyOptional({ enum: Object.values(TwoFactorMethod), isArray: true })
  methods?: TwoFactorMethod[];
}

export class TwoFactorResendRequestDto {
  @IsNotEmpty()
  @IsEnum(TwoFactorMethod)
  @ApiProperty({ enum: Object.values(TwoFactorMethod) })
  method: TwoFactorMethod;
}
