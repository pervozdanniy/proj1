import { Body, ClassSerializerInterceptor, Controller, HttpStatus, Patch, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtSessionAuth } from '~common/session';
import { CardResourceDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/card-resource.dto';
import { DepositFundsDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/deposit-funds.dto';
import { DocumentIdDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/document-id.dto';
import { SettleFundsDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/settle-funds.dto';
import { SettleWithdrawDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/settle-withdraw.dto';
import { VerifyOwnerDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/verify-owner.dto';
import { WebhookUrlDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/webhook-url.dto';
import { SandboxService } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/services/sandbox.service';

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
