import { JwtSessionAuth, JwtSessionUser } from '@/auth';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { PayWithBankRequestDto, StartWithdrawFlowDto, WithdrawStartResponseDto } from '../dtos/withdrawal/flow.dto';
import { WithdrawalMakeDto } from '../dtos/withdrawal/withdrawal-make.dto';
import { PaymentGatewayService } from '../services/payment-gateway.service';
import { WithdrawService } from '../services/withdraw.service';
import { BankTransferInfoDto, TransferInfoDto } from '../utils/prime-trust-response.dto';

@ApiTags('Withdrawal Funds')
@ApiBearerAuth()
@Controller({
  version: '1',
  path: 'withdrawal',
})
export class WithdrawalController {
  constructor(private paymentGatewayService: PaymentGatewayService, private readonly withdraw: WithdrawService) {}

  @ApiOperation({ summary: 'Make withdrawal.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: TransferInfoDto,
  })
  @JwtSessionAuth({ requireKYC: true })
  @Post('/make')
  async makeWithdrawal(@JwtSessionUser() { id }: User, @Body() payload: WithdrawalMakeDto) {
    return this.paymentGatewayService.makeWithdrawal({ id, ...payload });
  }

  @ApiOperation({ summary: 'Start withdraw flow' })
  @ApiCreatedResponse({ type: WithdrawStartResponseDto })
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @Post('/start')
  start(@Body() payload: StartWithdrawFlowDto, @JwtSessionUser() { id }: User): Promise<WithdrawStartResponseDto> {
    return this.withdraw.start(payload, id);
  }

  @ApiOperation({ summary: 'Select bank for withdraw' })
  @ApiCreatedResponse({ type: BankTransferInfoDto })
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @Post('/pay_with_bank')
  payWithBank(@Body() payload: PayWithBankRequestDto, @JwtSessionUser() { id }: User): Promise<BankTransferInfoDto> {
    return this.withdraw.payWithBank(payload, id);
  }
}
