import { SdkSandboxService } from '@/sdk/payment-gateway/prime_trust/services/sdk-sandbox.service';
import { Body, ClassSerializerInterceptor, Controller, HttpStatus, Patch, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtSessionAuth } from '~common/http-session';
import { DepositFundsDto } from '../dtos/deposit/deposit-funds.dto';
import { SettleFundsDto } from '../dtos/deposit/settle-funds.dto';
import { VerifyOwnerDto } from '../dtos/main/verify-owner.dto';
import { WebhookUrlDto } from '../dtos/main/webhook-url.dto';
import { SettleWithdrawDto } from '../dtos/withdrawal/settle-withdraw.dto';

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
