import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Injectable,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtSessionGuard } from '~common/session';
import { DepositFundsDto } from '~svc/api-gateway/src/payment-gateway/dtos/deposit-funds.dto';
import { SettleFundsDto } from '~svc/api-gateway/src/payment-gateway/dtos/settle-funds.dto';
import { SandboxService } from '~svc/api-gateway/src/payment-gateway/sandbox/sandbox.service';

@ApiTags('Sandbox')
@Injectable()
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'sandbox',
})
export class SandboxGatewayController {
  @Inject(SandboxService)
  private sandboxService: SandboxService;

  @ApiOperation({ summary: 'Send Deposit Funds request (testing mode).' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtSessionGuard)
  @Post('/deposit/funds')
  async depositFunds(@Body() payload: DepositFundsDto) {
    return this.sandboxService.depositFunds(payload);
  }

  @ApiOperation({ summary: 'Send Deposit Funds request (testing mode).' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtSessionGuard)
  @Post('/settle/funds')
  async settleFunds(@Body() payload: SettleFundsDto) {
    return this.sandboxService.settleFunds(payload);
  }
}
