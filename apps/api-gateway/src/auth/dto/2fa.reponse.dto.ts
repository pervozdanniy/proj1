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
}

export class TwoFactorVerifyDto {
  @ApiProperty({ enum: ['completed', 'partially_accepted'] })
  type: 'completed' | 'partially_accepted';

  @ApiProperty({ type: TwoFactorVerificationDto })
  verify?: TwoFactorVerificationDto;
}
