import { JwtSessionAuth, JwtSessionUser } from '@/api/auth';
import {
  ContributionResponseDTO,
  CreditCardResourceResponseDTO,
  CreditCardsResponseDTO,
  DepositResponseDTO,
  SuccessResponseDTO,
} from '@/api/payment-gateway/prime_trust/utils/prime-trust-response.dto';
import { Body, ClassSerializerInterceptor, Controller, Get, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { CardResourceDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/card-resource.dto';
import { DepositParamsDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/deposit-params.dto';
import { MakeContributionDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/make-contribution.dto';
import { PaymentGatewayService } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/services/payment-gateway.service';

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
  @JwtSessionAuth()
  @Post('/wire/reference')
  async createReference(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.createReference({ id });
  }

  /**
   * deposit funds ACH
   */

  @ApiOperation({ summary: 'Add Bank params for deposit.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: DepositResponseDTO,
  })
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
    type: CreditCardResourceResponseDTO,
  })
  @JwtSessionAuth()
  @Post('/credit_card/resource')
  async createCreditCardResource(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.createCreditCardResource({ id });
  }

  @ApiOperation({ summary: 'Verify Credit Card.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SuccessResponseDTO,
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
    type: CreditCardsResponseDTO,
  })
  @JwtSessionAuth()
  @Get('/credit_cards')
  async getCreditCards(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getCreditCards({ id });
  }

  @ApiOperation({ summary: 'Deposit funds by credit card.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ContributionResponseDTO,
  })
  @JwtSessionAuth()
  @Post('/contribution')
  async makeContribution(@JwtSessionUser() { id }: User, @Body() payload: MakeContributionDto) {
    return this.paymentGatewayService.makeContribution({ id, ...payload });
  }
}
