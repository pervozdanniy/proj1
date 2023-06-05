import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserBase } from '~common/grpc/interfaces/admin_panel';

export class BaseUserResponseDto implements UserBase {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  country_code: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  email_verified_at?: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  source: string;
}
