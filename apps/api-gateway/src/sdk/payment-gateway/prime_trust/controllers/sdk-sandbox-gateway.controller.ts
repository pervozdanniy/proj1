import { Body, ClassSerializerInterceptor, Controller, HttpStatus, Patch, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtSessionAuth } from '~common/http-session';
import { CardResourceDto } from '../dtos/deposit/card-resource.dto';
import { DepositFundsDto } from '../dtos/deposit/deposit-funds.dto';
import { SettleFundsDto } from '../dtos/deposit/settle-funds.dto';
import { VerifyOwnerDto } from '../dtos/deposit/verify-owner.dto';
import { AccountIdDto } from '../dtos/sandbox/account-id.dto';
import { AddAssetDto } from '../dtos/sandbox/add-asset.dto';
import { DocumentIdDto } from '../dtos/sandbox/document-id.dto';
import { WebhookUrlDto } from '../dtos/sandbox/webhook-url.dto';
import { SettleWithdrawDto } from '../dtos/withdrawal/settle-withdraw.dto';
import { SdkSandboxService } from '../services/sdk-sandbox.service';

@ApiTags('SDK/Prime Trust/Sandbox')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'sdk/sandbox',
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

  @ApiOperation({ summary: 'Add assets to account (for testing Ethereum)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/assets/add')
  async addAssets(@Body() payload: AddAssetDto) {
    return this.sandboxService.addAssets(payload);
  }

  @ApiOperation({ summary: 'Add assets to account (for testing Ethereum)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/assets/withdrawal/settle')
  async settleAssetsWithdrawal(@Body() payload: SettleWithdrawDto) {
    return this.sandboxService.settleAssetsWithdrawal(payload);
  }
}
