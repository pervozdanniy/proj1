import { Body, ClassSerializerInterceptor, Controller, Get, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import {JwtSessionAuth, JwtSessionUser} from '@/api/auth';
import { WithdrawalMakeDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/withdrawal-make.dto';
import { WithdrawalParamsDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/withdrawal-params.dto';
import { PaymentGatewayService } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/services/payment-gateway.service';

@ApiTags('Prime Trust/Withdrawal Funds')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'withdrawal',
})
export class WithdrawalController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  @ApiOperation({ summary: 'Get Bank params for withdrawal.' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @JwtSessionAuth()
  @Get('/params')
  async getWithdrawalParams(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getWithdrawalParams({ id });
  }

  @ApiOperation({ summary: 'Add Bank params for withdrawal.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/params')
  async addWithdrawalParams(@JwtSessionUser() { id }: User, @Body() payload: WithdrawalParamsDto) {
    return this.paymentGatewayService.addWithdrawalParams({ id, ...payload });
  }

  @ApiOperation({ summary: 'Make withdrawal.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/make')
  async makeWithdrawal(@JwtSessionUser() { id }: User, @Body() payload: WithdrawalMakeDto) {
    return this.paymentGatewayService.makeWithdrawal({ id, ...payload });
  }
}
