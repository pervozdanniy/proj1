import { Pagination } from '@/libs/pagination';
import { FilterDto } from '@/libs/pagination/dto/filter.dto';
import { CreateFeeBodyDto } from '@/modules/fee/dtos/create-fee.body.dto';
import { FeeResponseDto } from '@/modules/fee/dtos/fee.response.dto';
import { UpdateFeeBodyDto } from '@/modules/fee/dtos/update-fee.body.dto';
import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { FeeAdminServiceClient, FEE_ADMIN_SERVICE_NAME } from '~common/grpc/interfaces/admin_panel';
import { PaginationRequest } from '~common/interfaces/pagination';

@Injectable()
export class FeeService implements OnModuleInit {
  private adminPanelService: FeeAdminServiceClient;
  constructor(@InjectGrpc('core') private readonly adminPanel: ClientGrpc) {}

  onModuleInit() {
    this.adminPanelService = this.adminPanel.getService(FEE_ADMIN_SERVICE_NAME);
  }

  async getFeeList(pagination: PaginationRequest): Promise<any> {
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
    const { total, fees } = await firstValueFrom(this.adminPanelService.getFeeList({ pagination_params }));

    return Pagination.of<FeeResponseDto>(
      pagination,
      total,
      plainToInstance(FeeResponseDto, fees, { excludePrefixes: ['_'] }),
    );
  }

  async createFee(body: CreateFeeBodyDto): Promise<FeeResponseDto> {
    const fee = await firstValueFrom(this.adminPanelService.createFee(body));

    return plainToInstance(FeeResponseDto, fee, { excludePrefixes: ['_'] });
  }

  async updateFee(id: number, data: UpdateFeeBodyDto): Promise<FeeResponseDto> {
    const fee = await firstValueFrom(this.adminPanelService.updateFeeById({ id, data }));

    return plainToInstance(FeeResponseDto, fee, { excludePrefixes: ['_'] });
  }

  async deleteFee(id: number): Promise<void> {
    await firstValueFrom(this.adminPanelService.deleteFeeById({ id }));
  }
}
