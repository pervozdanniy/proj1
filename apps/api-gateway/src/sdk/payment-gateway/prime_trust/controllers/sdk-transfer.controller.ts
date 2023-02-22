import { SdkPaymentGatewayService } from '@/sdk/payment-gateway/prime_trust/services/sdk-payment-gateway.service';
import { Body, ClassSerializerInterceptor, Controller, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionAuth, JwtSessionUser } from '~common/http-session';
import { TransferFundsDto } from '../dtos/transfer/transfer-funds.dto';

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
}
