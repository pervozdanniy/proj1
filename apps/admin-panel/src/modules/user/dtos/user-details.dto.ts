import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserDetails } from '~common/grpc/interfaces/common';

export class UserDetailsDto implements UserDetails {
  @ApiPropertyOptional()
  first_name?: string | undefined;

  @ApiPropertyOptional()
  last_name?: string | undefined;

  @ApiPropertyOptional()
  date_of_birth?: string | undefined;

  @ApiPropertyOptional()
  city?: string | undefined;

  @ApiPropertyOptional()
  street?: string | undefined;

  @ApiPropertyOptional()
  postal_code?: number | undefined;

  @ApiPropertyOptional()
  tax_id_number?: number | undefined;

  @ApiPropertyOptional()
  region?: string | undefined;

  @ApiPropertyOptional()
  send_type?: number | undefined;

  @ApiPropertyOptional()
  avatar?: string | undefined;

  @ApiPropertyOptional()
  apartment?: string | undefined;
}
