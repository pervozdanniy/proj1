import { JwtSessionAuth, JwtSessionUser } from '@/api/auth';
import { PaymentGatewayService } from '@/api/payment-gateway/prime_trust/services/payment-gateway.service';
import { TransferFundsResponseDTO } from '@/api/payment-gateway/prime_trust/utils/prime-trust-response.dto';
import { Body, ClassSerializerInterceptor, Controller, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { TransferFundsDto } from '../dtos/transfer/transfer-funds.dto';

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
    type: TransferFundsResponseDTO,
  })
  @JwtSessionAuth()
  @Post('/funds')
  async transferFunds(@JwtSessionUser() { id }: User, @Body() payload: TransferFundsDto) {
    return this.paymentGatewayService.transferFunds({ sender_id: id, ...payload });
  }
}
