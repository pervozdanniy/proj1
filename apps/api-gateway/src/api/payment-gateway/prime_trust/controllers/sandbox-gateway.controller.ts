import { AccountIdDto } from '@/api/payment-gateway/prime_trust/dtos/account-id.dto';
import { CardResourceDto } from '@/api/payment-gateway/prime_trust/dtos/card-resource.dto';
import { DepositFundsDto } from '@/api/payment-gateway/prime_trust/dtos/deposit-funds.dto';
import { DocumentIdDto } from '@/api/payment-gateway/prime_trust/dtos/document-id.dto';
import { SettleFundsDto } from '@/api/payment-gateway/prime_trust/dtos/settle-funds.dto';
import { SettleWithdrawDto } from '@/api/payment-gateway/prime_trust/dtos/settle-withdraw.dto';
import { VerifyOwnerDto } from '@/api/payment-gateway/prime_trust/dtos/verify-owner.dto';
import { WebhookUrlDto } from '@/api/payment-gateway/prime_trust/dtos/webhook-url.dto';
import { SandboxService } from '@/api/payment-gateway/prime_trust/services/sandbox.service';
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
export class SandboxGatewayController {
  constructor(private sandboxService: SandboxService) {}

  @ApiOperation({ summary: 'Bind existed accounts to current webhook.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Patch('/webhook/change')
  async bind(@Body() payload: WebhookUrlDto) {
    return this.sandboxService.bind(payload);
  }

  @ApiOperation({ summary: 'Open Account Testing Mode.' })
  @Post('/account/open')
  @JwtSessionAuth()
  async openAccount(@Body() payload: AccountIdDto) {
    return this.sandboxService.openAccount(payload);
  }

  @ApiOperation({ summary: 'Verify document by id.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/kyc/document/verify')
  async verifyDocument(@Body() payload: DocumentIdDto) {
    return this.sandboxService.verifyDocument(payload);
  }
  @ApiOperation({ summary: 'Fail document by id.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/kyc/document/fail')
  async failDocument(@Body() payload: DocumentIdDto) {
    return this.sandboxService.failDocument(payload);
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

  @ApiOperation({ summary: 'Get Credit Card Descriptor for verification 4 digits).' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/card/verification/number')
  async getCardDescriptor(@Body() payload: CardResourceDto) {
    return this.sandboxService.getCardDescriptor(payload);
  }
}
