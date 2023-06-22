import { JwtSessionAuth, JwtSessionUser } from '@/auth';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { WithdrawalMakeDto } from '../dtos/withdrawal/withdrawal-make.dto';
import { PaymentGatewayService } from '../services/payment-gateway.service';
import { TransferInfoDto } from '../utils/prime-trust-response.dto';

@ApiTags('Withdrawal Funds')
@ApiBearerAuth()
@Controller({
  version: '1',
  path: 'withdrawal',
})
export class WithdrawalController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  @ApiOperation({ summary: 'Make withdrawal.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: TransferInfoDto,
  })
  @JwtSessionAuth({ requireKYC: true })
  @Post('/make')
  async makeWithdrawal(@JwtSessionUser() { id }: User, @Body() payload: WithdrawalMakeDto) {
    return this.paymentGatewayService.makeWithdrawal({ id, ...payload });
  }
}
