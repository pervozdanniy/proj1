import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
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
  @Get(':transfer_id')
  async getTransferById(@JwtSessionUser() { id }: User, @Param('transfer_id') transfer_id: number) {
    return this.paymentGatewayService.getTransferById({ id, resource_id: transfer_id });
  }
}
