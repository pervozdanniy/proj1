import { JwtSessionAuth, JwtSessionUser } from '@/auth';
import { PaymentGatewayService } from '@/payment-gateway/prime_trust/services/payment-gateway.service';
import {
  ContributionResponseDto,
  CreditCardResourceResponseDto,
  SuccessResponseDto,
} from '@/payment-gateway/prime_trust/utils/prime-trust-response.dto';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Render,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { CreditCardTokenDto } from '../dtos/deposit/credit-card-token.dto';
import {
  DepositStartResponseDto,
  PayWithBankRequestDto,
  PayWithCardRequestDto,
  StartDepositFlowDto,
} from '../dtos/deposit/flow.dto';
import { MakeDepositDto } from '../dtos/deposit/make-deposit.dto';
import { SettleFundsDto } from '../dtos/deposit/settle-funds.dto';
import { VerifyCardDto } from '../dtos/deposit/verify-card.dto';
import { DepositService } from '../services/deposit.service';

@ApiTags('Deposit Funds')
@UseInterceptors(ClassSerializerInterceptor)
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

  @ApiOperation({ summary: 'Deposit funds by credit card.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ContributionResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @Post('/make')
  async makeDeposit(@JwtSessionUser() { id }: User, @Body() payload: MakeDepositDto) {
    return this.paymentGatewayService.makeDeposit({ id, ...payload });
  }

  @ApiOperation({ summary: 'Start deposit flow' })
  @ApiCreatedResponse({ type: DepositStartResponseDto })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Post('/start')
  start(@Body() payload: StartDepositFlowDto, @JwtSessionUser() { id }: User) {
    return this.depositService.start(payload, id);
  }

  @ApiOperation({ summary: 'Select bank for deposit' })
  @ApiCreatedResponse({ type: SettleFundsDto })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Post('/pay-with-bank')
  payWithBank(@Body() payload: PayWithBankRequestDto, @JwtSessionUser() { id }: User) {
    return this.depositService.payWithBank(payload, id);
  }

  @ApiOperation({ summary: 'Select card for deposit' })
  @ApiCreatedResponse({ type: SettleFundsDto })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Post('/pay-with-card')
  payWithCard(@Body() payload: PayWithCardRequestDto, @JwtSessionUser() { id }: User) {
    return this.depositService.payWithCard(payload, id);
  }
}
