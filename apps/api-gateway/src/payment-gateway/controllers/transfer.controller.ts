import { JwtSessionAuth, JwtSessionUser } from '@/auth';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { TransferFundsRequestDto } from '../dtos/transfer/transfer-funds.dto';
import { PaymentGatewayService } from '../services/payment-gateway.service';
import { TransferFundsResponseDto } from '../utils/prime-trust-response.dto';

@ApiTags('Transfer Funds')
@ApiBearerAuth()
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
