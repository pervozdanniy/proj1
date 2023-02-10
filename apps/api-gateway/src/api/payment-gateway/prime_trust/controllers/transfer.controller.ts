import { JwtSessionAuth, JwtSessionUser } from '@/api/auth';
import {
  BankAccountResponseDTO,
  TransferFundsResponseDTO,
} from '@/api/payment-gateway/prime_trust/utils/prime-trust-response.dto';
import { Body, ClassSerializerInterceptor, Controller, Get, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
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

  @ApiOperation({ summary: 'Get Transfers Between Accounts.' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @JwtSessionAuth()
  @Get('/')
  async getTransfers(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getTransfers({ id });
  }
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
