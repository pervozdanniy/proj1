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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { PaymentGatewayService } from '~svc/sdk-gateway/src/payment-gateway/prime_trust/services/payment-gateway.service';
import { JwtSessionAuth, JwtSessionUser } from '../../../client/decorators/jwt-client.decorator';
import { CreditCardTokenDto } from '../dtos/deposit/credit-card-token.dto';
import { CreateReferenceDto } from '../dtos/deposit/deposit-funds.dto';
import { DepositParamsDto } from '../dtos/deposit/deposit-params.dto';
import { MakeDepositDto } from '../dtos/deposit/make-deposit.dto';
import { VerifyCardDto } from '../dtos/deposit/verify-card.dto';
import {
  ContributionResponseDto,
  CreditCardResourceResponseDto,
  CreditCardsResponseDto,
  DepositResponseDto,
  SuccessResponseDto,
} from '../utils/prime-trust-response.dto';

@ApiTags('Prime Trust/Deposit Funds')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'deposit',
})
export class DepositController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  @ApiOperation({ summary: 'Add Wire transfer reference.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiBearerAuth()
  @JwtSessionAuth({ requireKYC: true })
  @Post('/wire/reference')
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
  @JwtSessionAuth()
  @Post('/add/params')
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
  @JwtSessionAuth({ requireKYC: true })
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
}