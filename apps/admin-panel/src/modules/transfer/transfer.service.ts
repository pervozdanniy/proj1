import { Pagination, PaginationRequest, PaginationResponseDto } from '@/libs/pagination';
import { FilterDto } from '@/libs/pagination/dto/filter.dto';
import { TransferResponseDto } from '@/modules/transfer/dtos/transfer-response.dto';
import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
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
    if (pagination?.params?.filter) {
      if (validateSync(plainToInstance(FilterDto, pagination.params)).length > 0) {
        throw new HttpException(
          {
            statusCode: 400,
            message: 'filter must be a json string',
          },
          400,
        );
      }

      pagination.params.filter = JSON.parse(pagination.params.filter);
    }

    const pagination_params = JSON.stringify(pagination);
    const { total, transfers } = await firstValueFrom(this.adminPanelService.getTransferList({ pagination_params }));

    return Pagination.of<TransferResponseDto>(
      pagination,
      total,
      plainToInstance(TransferResponseDto, transfers, { excludePrefixes: ['_'] }),
    );
  }
}
