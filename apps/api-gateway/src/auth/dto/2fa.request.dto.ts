import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { TwoFactorMethod } from '~common/constants/auth';

export class TwoFactorVerificationDto {
  @IsNotEmpty()
  @IsEnum(TwoFactorMethod)
  @ApiProperty({ enum: Object.values(TwoFactorMethod) })
  method: TwoFactorMethod;

  @IsNotEmpty()
  @IsInt()
  code: number;
}

export class TwoFactorRequestDto {
  @IsArray()
  @IsNotEmpty()
  @Type(() => TwoFactorVerificationDto)
  @ValidateNested({ each: true })
  @ApiProperty({ type: TwoFactorVerificationDto, isArray: true })
  codes: TwoFactorVerificationDto[];
}
