import { JwtSessionAuth, JwtSessionUser } from '@/auth';
import { PaymentGatewayService } from '@/payment-gateway/prime_trust/services/payment-gateway.service';
import {
  BankTransferInfoDto,
  CreditCardResourceResponseDto,
  SuccessResponseDto,
  TransferInfoDto,
} from '@/payment-gateway/prime_trust/utils/prime-trust-response.dto';
import { Body, Controller, Get, HttpStatus, Post, Query, Render } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { CreditCardTokenDto } from '../dtos/deposit/credit-card-token.dto';
import {
  DepositStartResponseDto,
  PayWithBankRequestDto,
  PayWithCardRequestDto,
  StartDepositFlowDto,
} from '../dtos/deposit/flow.dto';
import { VerifyCardDto } from '../dtos/deposit/verify-card.dto';
import { DepositService } from '../services/deposit.service';

@ApiTags('Deposit Funds')
@Controller({
  version: '1',
  path: 'deposit',
})
export class DepositController {
  constructor(private paymentGatewayService: PaymentGatewayService, private readonly depositService: DepositService) {}

  @ApiOperation({ summary: 'Create Credit Card Resource.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreditCardResourceResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @Post('/credit_card/resource')
  async createCreditCardResource(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.createCreditCardResource({ id });
  }

  @ApiOperation({ summary: 'Create Credit Card Resource.' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Get('/credit_card/widget')
  @Render('credit_card')
  async cardWidget(@Query() { token, resource_id }: CreditCardTokenDto) {
    return { token, resource_id };
  }

  @ApiOperation({ summary: 'Verify Credit Card.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SuccessResponseDto,
  })
  @Post('/credit_card/verify')
  async verifyCreditCard(@Body() payload: VerifyCardDto) {
    return this.paymentGatewayService.verifyCreditCard(payload);
  }

  @ApiOperation({ summary: 'Start deposit flow' })
  @ApiCreatedResponse({ type: DepositStartResponseDto })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Post('/start')
  start(@Body() payload: StartDepositFlowDto, @JwtSessionUser() { id }: User): Promise<DepositStartResponseDto> {
    return this.depositService.start(payload, id);
  }

  @ApiOperation({ summary: 'Select bank for deposit' })
  @ApiCreatedResponse({ type: BankTransferInfoDto })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Post('/pay_with_bank')
  payWithBank(@Body() payload: PayWithBankRequestDto, @JwtSessionUser() { id }: User): Promise<BankTransferInfoDto> {
    return this.depositService.payWithBank(payload, id);
  }

  @ApiOperation({ summary: 'Select card for deposit' })
  @ApiCreatedResponse({ type: TransferInfoDto })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Post('/pay_with_card')
  payWithCard(@Body() payload: PayWithCardRequestDto, @JwtSessionUser() { id }: User): Promise<TransferInfoDto> {
    return this.depositService.payWithCard(payload, id);
  }
}
