import { Fee } from '~common/grpc/interfaces/admin_panel';

export class FeeResponseDto implements Fee {
  id: number;
  country?: string | undefined;
  percent: number;
  fixed_usd?: number | undefined;
}
