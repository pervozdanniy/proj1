import { PaginationArgumentDto } from '@/admin-panel/shared/dto/pagination-argument.dto';
import { ResponseTransferListDto } from '@/admin-panel/transfer.admin/dto/response-transfer-list.dto';
import { TransferAdminService } from '@/admin-panel/transfer.admin/transfer.admin.service';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  TransferAdminServiceController,
  TransferAdminServiceControllerMethods,
  TransferList,
} from '~common/grpc/interfaces/admin_panel';
import { PaginationRequest } from '~common/interfaces/pagination';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';

@RpcController()
@TransferAdminServiceControllerMethods()
export class TransferAdminController implements TransferAdminServiceController {
  constructor(private readonly transferAdminService: TransferAdminService) {}

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getTransferList({ pagination_params }: PaginationArgumentDto): Promise<TransferList> {
    const pagination: PaginationRequest = JSON.parse(pagination_params);
    const [transfers, total] = await this.transferAdminService.getTransferList(pagination);

    return plainToInstance(ResponseTransferListDto, { transfers, total });
  }
}
