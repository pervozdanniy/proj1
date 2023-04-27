import { JwtSessionAuth, JwtSessionUser } from '@/api/auth';
import { PaymentGatewayService } from '@/api/payment-gateway/prime_trust/services/payment-gateway.service';
import {
  ContributionResponseDto,
  CreditCardResourceResponseDto,
  CreditCardsResponseDto,
  DepositResponseDto,
  SuccessResponseDto,
} from '@/api/payment-gateway/prime_trust/utils/prime-trust-response.dto';
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
import { CreateReferenceDto } from '../dtos/deposit/deposit-funds.dto';
import { DepositParamsDto } from '../dtos/deposit/deposit-params.dto';
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

  @ApiOperation({ summary: 'Add Wire transfer reference.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @Post('/payment/reference')
  async createReference(@JwtSessionUser() { id }: User, @Body() payload: CreateReferenceDto) {
    return this.paymentGatewayService.createReference({ id, ...payload });
  }

  /**
   * deposit funds ACH
   */

  @ApiOperation({ summary: 'Add Bank params for deposit.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: DepositResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @Post('/params')
  async addDepositParams(@JwtSessionUser() { id }: User, @Body() payload: DepositParamsDto) {
    return this.paymentGatewayService.addDepositParams({ id, ...payload });
  }

  /**
   * credit card
   */

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

  @ApiOperation({ summary: 'Get Credit Cards.' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CreditCardsResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Get('/credit_cards')
  async getCreditCards(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getCreditCards({ id });
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

  @ApiOperation({ summary: 'Get Deposit Params' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Get('/params')
  async getDepositParams(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getDepositParams({ id });
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
