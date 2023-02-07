import { Body, ClassSerializerInterceptor, Controller, Get, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionAuth, JwtSessionUser } from '~common/session';
import { CardResourceDto } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/dtos/card-resource.dto';
import { MakeContributionDto } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/dtos/make-contribution.dto';
import { SdkPaymentGatewayService } from '~svc/api-gateway/src/sdk/payment-gateway/prime_trust/services/sdk-payment-gateway.service';

@ApiTags('Prime Trust/Deposit Funds')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'deposit',
})
export class SdkDepositController {
  constructor(private paymentGatewayService: SdkPaymentGatewayService) {}

  @ApiOperation({ summary: 'Add Wire transfer reference.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/wire/reference')
  async createReference(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.createReference({ id });
  }

  @ApiOperation({ summary: 'Create Credit Card Resource.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/credit_card/resource')
  async createCreditCardResource(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.createCreditCardResource({ id });
  }

  /**
   * credit card
   */

  @ApiOperation({ summary: 'Verify Credit Card.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
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
  })
  @JwtSessionAuth()
  @Get('/credit_cards')
  async getCreditCards(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getCreditCards({ id });
  }

  @ApiOperation({ summary: 'Deposit funds by credit card.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/contribution')
  async makeContribution(@JwtSessionUser() { id }: User, @Body() payload: MakeContributionDto) {
    return this.paymentGatewayService.makeContribution({ id, ...payload });
  }
}
