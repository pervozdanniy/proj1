import { DepositFundsDto } from '@/sdk/payment-gateway/prime_trust/dtos/deposit-funds.dto';
import { SettleFundsDto } from '@/sdk/payment-gateway/prime_trust/dtos/settle-funds.dto';
import { SettleWithdrawDto } from '@/sdk/payment-gateway/prime_trust/dtos/settle-withdraw.dto';
import { VerifyOwnerDto } from '@/sdk/payment-gateway/prime_trust/dtos/verify-owner.dto';
import { WebhookUrlDto } from '@/sdk/payment-gateway/prime_trust/dtos/webhook-url.dto';
import { SdkSandboxService } from '@/sdk/payment-gateway/prime_trust/services/sdk-sandbox.service';
import { Body, ClassSerializerInterceptor, Controller, HttpStatus, Patch, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtSessionAuth } from '~common/http-session';

@ApiTags('Prime Trust/Sandbox')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'sandbox',
})
export class SdkSandboxGatewayController {
  constructor(private sandboxService: SdkSandboxService) {}

  @ApiOperation({ summary: 'Bind existed accounts to current webhook.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Patch('/webhook/change')
  async bind(@Body() payload: WebhookUrlDto) {
    return this.sandboxService.bind(payload);
  }

  @ApiOperation({ summary: 'Send Deposit Funds request (testing mode).' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/deposit/funds')
  async depositFunds(@Body() payload: DepositFundsDto) {
    return this.sandboxService.depositFunds(payload);
  }

  @ApiOperation({ summary: 'Approve Deposit Funds request (testing mode).' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/settle/funds')
  async settleFunds(@Body() payload: SettleFundsDto) {
    return this.sandboxService.settleFunds(payload);
  }

  @ApiOperation({ summary: 'Verify owner after make withdrawal (testing mode).' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/verify/owner')
  async verifyOwner(@Body() payload: VerifyOwnerDto) {
    return this.sandboxService.verifyOwner(payload);
  }

  @ApiOperation({ summary: 'Settle withdraw (testing mode).' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/settle/withdraw')
  async settleWithdraw(@Body() payload: SettleWithdrawDto) {
    return this.sandboxService.settleWithdraw(payload);
  }
}
