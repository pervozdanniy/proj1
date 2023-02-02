import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtSessionAuth } from '~common/session';
import { CardResourceDto } from '~svc/api-gateway/src/api/payment-gateway/dtos/card-resource.dto';
import { DepositFundsDto } from '~svc/api-gateway/src/api/payment-gateway/dtos/deposit-funds.dto';
import { SettleFundsDto } from '~svc/api-gateway/src/api/payment-gateway/dtos/settle-funds.dto';
import { SettleWithdrawDto } from '~svc/api-gateway/src/api/payment-gateway/dtos/settle-withdraw.dto';
import { VerifyOwnerDto } from '~svc/api-gateway/src/api/payment-gateway/dtos/verify-owner.dto';
import { WebhookUrlDto } from '~svc/api-gateway/src/api/payment-gateway/dtos/webhook-url.dto';
import { SandboxService } from '~svc/api-gateway/src/api/payment-gateway/services/sandbox.service';

@ApiTags('Sandbox')
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

  @ApiOperation({ summary: 'Verify owner for after make withdrawal (testing mode).' })
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
