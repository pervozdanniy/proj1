import { JwtSessionAuth, JwtSessionUser } from '@/api/auth';
import { PaymentGatewayService } from '@/api/payment-gateway/prime_trust/services/payment-gateway.service';
import {
  ContributionResponseDto,
  CreditCardResourceResponseDto,
  CreditCardsResponseDto,
  DepositResponseDto,
  SuccessResponseDto,
} from '@/api/payment-gateway/prime_trust/utils/prime-trust-response.dto';
import { Body, ClassSerializerInterceptor, Controller, Get, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { CardResourceDto } from '../dtos/deposit/card-resource.dto';
import { CreateReferenceDto } from '../dtos/deposit/deposit-funds.dto';
import { DepositParamsDto } from '../dtos/deposit/deposit-params.dto';
import { MakeDepositDto } from '../dtos/deposit/make-deposit.dto';

@ApiTags('Prime Trust/Deposit Funds')
@ApiBearerAuth()
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
  @JwtSessionAuth({ requireKYC: true })
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
  @JwtSessionAuth({ requireKYC: true })
  @Post('/credit_card/resource')
  async createCreditCardResource(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.createCreditCardResource({ id });
  }

  @ApiOperation({ summary: 'Verify Credit Card.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SuccessResponseDto,
  })
  @JwtSessionAuth()
  @Post('/credit_card/verify')
  async verifyCreditCard(@JwtSessionUser() { id }: User, @Body() payload: CardResourceDto) {
    const { resource_id } = payload;

    return this.paymentGatewayService.verifyCreditCard({ id, resource_id });
  }

  @ApiOperation({ summary: 'Get Credit Cards.' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CreditCardsResponseDto,
  })
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
  @JwtSessionAuth({ requireKYC: true })
  @Post('/make')
  async makeDeposit(@JwtSessionUser() { id }: User, @Body() payload: MakeDepositDto) {
    return this.paymentGatewayService.makeDeposit({ id, ...payload });
  }

  @ApiOperation({ summary: 'Get Deposit Params' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @JwtSessionAuth()
  @Get('/params')
  async getDepositParams(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getDepositParams({ id });
  }
}
