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
