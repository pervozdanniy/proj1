import { Body, ClassSerializerInterceptor, Controller, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionAuth, JwtSessionUser } from '~common/session';
import { TransferFundsDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/transfer-funds.dto';
import { PaymentGatewayService } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/services/payment-gateway.service';

@ApiTags('Prime Trust/Transfer Funds')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'transfer',
})
export class TransferController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}
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