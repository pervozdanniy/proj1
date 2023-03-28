import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TwoFactorMethod } from '~common/constants/auth';

export class TwoFactorSuccessResponseDto {
  @ApiProperty({ default: true })
  valid: true;
}

export class TwoFactorRequiredResponseDto {
  @ApiProperty({ example: '2FA required' })
  message: string;

  @ApiProperty({ enum: Object.values(TwoFactorMethod), isArray: true })
  methods: TwoFactorMethod[];

  @ApiPropertyOptional()
  access_token?: string;
}

export class TwoFactorVerificationDto {
  @ApiProperty({ enum: Object.values(TwoFactorMethod), isArray: true })
  methods: string[];

  @ApiProperty({ example: 'Password reset confirmation' })
  type: string;
}

export class TwoFactorAppliedResponseDto {
  @ApiPropertyOptional()
  access_token?: string;

  @ApiProperty({ type: TwoFactorVerificationDto })
  verify: TwoFactorVerificationDto;
}
