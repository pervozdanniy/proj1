import { FeeResponseDto } from '@/admin-panel/fee.admin/dto/response/fee.response.dto';
import { FeeList } from '~common/grpc/interfaces/admin_panel';

export class FeeListResponseDto implements FeeList {
  fees: FeeResponseDto[];
  total: number;
}
