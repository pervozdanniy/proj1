import { CreateFeeArgumentDto } from '@/admin-panel/fee.admin/dto/arguments/create-fee.argument.dto';
import { DeleteFeeArgumentDto } from '@/admin-panel/fee.admin/dto/arguments/delete-fee.argument.dto';
import { UpdateFeeArgumentDto } from '@/admin-panel/fee.admin/dto/arguments/update-fee.argument.dto';
import { FeeListResponseDto } from '@/admin-panel/fee.admin/dto/response/fee-list.response.dto';
import { FeeResponseDto } from '@/admin-panel/fee.admin/dto/response/fee.response.dto';
import { FeeAdminService } from '@/admin-panel/fee.admin/fee.admin.service';
import { PaginationArgumentDto } from '@/admin-panel/shared/dto/pagination-argument.dto';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  Fee,
  FeeAdminServiceController,
  FeeAdminServiceControllerMethods,
  FeeList,
} from '~common/grpc/interfaces/admin_panel';
import { PaginationRequest } from '~common/interfaces/pagination';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';

@RpcController()
@FeeAdminServiceControllerMethods()
export class FeeAdminController implements FeeAdminServiceController {
  constructor(private readonly feeAdminService: FeeAdminService) {}

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createFee(fee: CreateFeeArgumentDto): Promise<Fee> {
    const result = await this.feeAdminService.createFee(fee);

    return plainToInstance(FeeResponseDto, result);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getFeeList({ pagination_params }: PaginationArgumentDto): Promise<FeeList> {
    const pagination: PaginationRequest = JSON.parse(pagination_params);

    const [fees, total] = await this.feeAdminService.getFeeList(pagination);

    return plainToInstance(FeeListResponseDto, { fees, total });
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateFeeById(updateFeeArgument: UpdateFeeArgumentDto): Promise<Fee> {
    const result = await this.feeAdminService.updateFeeById(updateFeeArgument);

    return plainToInstance(FeeResponseDto, result);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async deleteFeeById(deleteFeeArgument: DeleteFeeArgumentDto): Promise<void> {
    await this.feeAdminService.deleteFeeById(deleteFeeArgument);
  }
}
