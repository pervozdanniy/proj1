import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TwoFactorVerificationDto } from './2fa.reponse.dto';

export class AuthResponseDto {
  @ApiProperty({ enum: ['verification_required', 'success'] })
  type: 'verification_required' | 'success';

  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;

  @ApiPropertyOptional({ type: TwoFactorVerificationDto })
  verify?: TwoFactorVerificationDto;
}
