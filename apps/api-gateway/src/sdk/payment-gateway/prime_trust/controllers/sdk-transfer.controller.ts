import { ResourceDto } from '@/api/payment-gateway/prime_trust/dtos/resource.dto';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionAuth, JwtSessionUser } from '~common/http-session';
import { TransferFundsDto } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/dtos/transfer-funds.dto';
import { SdkPaymentGatewayService } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/services/sdk-payment-gateway.service';

@ApiTags('Prime Trust/Transfer Funds')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'transfer',
})
export class SdkTransferController {
  constructor(private paymentGatewayService: SdkPaymentGatewayService) {}
  @ApiOperation({ summary: 'Transfer funds.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/funds')
  async transferFunds(@JwtSessionUser() { id }: User, @Body() payload: TransferFundsDto) {
    return this.paymentGatewayService.transferFunds({ sender_id: id, ...payload });
  }

  @ApiOperation({ summary: 'Get Transfer by id.' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @JwtSessionAuth()
  @Get('/')
  async getTransferById(@JwtSessionUser() { id }: User, @Query() query: ResourceDto) {
    return this.paymentGatewayService.getTransferById({ id, resource_id: query.resource_id });
  }
}
