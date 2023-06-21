import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Fee } from '~common/grpc/interfaces/admin_panel';

export class FeeResponseDto implements Fee {
  @ApiProperty()
  id: number;

  @ApiPropertyOptional()
  country?: string | undefined;

  @ApiProperty()
  percent: number;

  @ApiPropertyOptional()
  fixed_usd?: number | undefined;
}
