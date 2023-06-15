import { ApiPaginatedResponse, PaginationParams, PaginationRequest, PaginationResponseDto } from '@/libs/pagination';
import { TransferResponseDto } from '@/modules/transfer/dtos/transfer-response.dto';
import { TransferService } from '@/modules/transfer/transfer.service';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PM } from '../../constants/permission/map.permission';
import { Permissions, TOKEN_NAME } from '../auth';

@ApiTags('Transfers')
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: 'transfers',
  version: '1',
})
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @ApiOperation({ description: 'Get a paginated transfer list' })
  @ApiPaginatedResponse(TransferResponseDto)
  @ApiQuery({
    name: 'filter',
    type: 'string',
    required: false,
    description: 'JSON String Where Key=Column Name, Value=Array of Values',
    example: '{ "user_id": [31, 35], "type": ["deposit", "withdrawal"], "provider": ["prime_trust"] }',
  })
  @Permissions(PM.transfers.read)
  @Get()
  public getTransferList(
    @PaginationParams() pagination: PaginationRequest,
  ): Promise<PaginationResponseDto<TransferResponseDto>> {
    return this.transferService.getTransferList(pagination);
  }
}
