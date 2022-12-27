import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtSessionGuard } from '~common/session';
import { DepositFundsDto } from '~svc/api-gateway/src/payment-gateway/dtos/deposit-funds.dto';
import { SettleFundsDto } from '~svc/api-gateway/src/payment-gateway/dtos/settle-funds.dto';
import { PaymentGatewayService } from '~svc/api-gateway/src/payment-gateway/services/payment-gateway.service';

@ApiTags('Sandbox')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'sandbox',
})
export class SandboxGatewayController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  @ApiOperation({ summary: 'Send Deposit Funds request (testing mode).' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @UseGuards(JwtSessionGuard)
  @Post('/deposit/funds')
  async depositFunds(@Body() payload: DepositFundsDto) {
    return this.paymentGatewayService.depositFunds(payload);
  }

  @ApiOperation({ summary: 'Send Deposit Funds request (testing mode).' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @UseGuards(JwtSessionGuard)
  @Post('/settle/funds')
  async settleFunds(@Body() payload: SettleFundsDto) {
    return this.paymentGatewayService.settleFunds(payload);
  }
}
