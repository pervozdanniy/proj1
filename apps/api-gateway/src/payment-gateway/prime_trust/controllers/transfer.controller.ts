import { JwtSessionAuth, JwtSessionUser } from '@/auth';
import { PaymentGatewayService } from '@/payment-gateway/prime_trust/services/payment-gateway.service';
import { Body, ClassSerializerInterceptor, Controller, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { TransferFundsRequestDto } from '../dtos/transfer/transfer-funds.dto';
import { TransferFundsResponseDto } from '../utils/prime-trust-response.dto';

@ApiTags('Transfer Funds')
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
  @Post()
  async transferFunds(@JwtSessionUser() { id }: User, @Body() payload: TransferFundsRequestDto) {
    return this.paymentGatewayService.transferFunds({ sender_id: id, ...payload });
  }
}
