import { Body, ClassSerializerInterceptor, Controller, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionAuth, JwtSessionUser } from '~common/http-session';
import { PaymentGatewayService } from '~svc/sdk-gateway/src/payment-gateway/prime_trust/services/payment-gateway.service';
import { TransferFundsRequestDto } from '../dtos/transfer/transfer-funds.dto';
import { TransferFundsResponseDto } from '../utils/prime-trust-response.dto';

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
    type: TransferFundsResponseDto,
  })
  @JwtSessionAuth({ requireKYC: true })
  @Post('/funds')
  async transferFunds(@JwtSessionUser() { id }: User, @Body() payload: TransferFundsRequestDto) {
    return this.paymentGatewayService.transferFunds({ sender_id: id, ...payload });
  }
}
