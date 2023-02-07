import { Body, ClassSerializerInterceptor, Controller, Get, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionAuth, JwtSessionUser } from '~common/session';
import { WithdrawalMakeDto } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/dtos/withdrawal-make.dto';
import { WithdrawalParamsDto } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/dtos/withdrawal-params.dto';
import { SdkPaymentGatewayService } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/services/sdk-payment-gateway.service';

@ApiTags('Prime Trust/Withdrawal Funds')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'withdrawal',
})
export class SdkWithdrawalController {
  constructor(private paymentGatewayService: SdkPaymentGatewayService) {}

  @ApiOperation({ summary: 'Get Bank params for withdrawal.' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @JwtSessionAuth()
  @Get('/withdrawal/params')
  async getWithdrawalParams(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getWithdrawalParams({ id });
  }

  @ApiOperation({ summary: 'Add Bank params for withdrawal.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/withdrawal/params')
  async addWithdrawalParams(@JwtSessionUser() { id }: User, @Body() payload: WithdrawalParamsDto) {
    return this.paymentGatewayService.addWithdrawalParams({ id, ...payload });
  }

  @ApiOperation({ summary: 'Make withdrawal.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/withdrawal/make')
  async makeWithdrawal(@JwtSessionUser() { id }: User, @Body() payload: WithdrawalMakeDto) {
    return this.paymentGatewayService.makeWithdrawal({ id, ...payload });
  }
}