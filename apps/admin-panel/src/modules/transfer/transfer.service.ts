import { Pagination, PaginationRequest, PaginationResponseDto } from '@/libs/pagination';
import { TransferResponseDto } from '@/modules/transfer/dtos/transfer-response.dto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '../../../../../common/grpc/helpers';
import {
  TransferAdminServiceClient,
  TRANSFER_ADMIN_SERVICE_NAME,
} from '../../../../../common/grpc/interfaces/admin_panel';

@Injectable()
export class TransferService implements OnModuleInit {
  private adminPanelService: TransferAdminServiceClient;
  constructor(@InjectGrpc('core') private readonly adminPanel: ClientGrpc) {}

  onModuleInit() {
    this.adminPanelService = this.adminPanel.getService(TRANSFER_ADMIN_SERVICE_NAME);
  }

  async getTransferList(pagination: PaginationRequest): Promise<PaginationResponseDto<TransferResponseDto>> {
    const pagination_params = JSON.stringify(pagination);
    const { total, transfers } = await firstValueFrom(this.adminPanelService.getTransferList({ pagination_params }));

    return Pagination.of<TransferResponseDto>(
      pagination,
      total,
      plainToInstance(TransferResponseDto, transfers, { excludePrefixes: ['_'] }),
    );
  }
}
