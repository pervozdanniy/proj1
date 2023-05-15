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
import { MakeDepositDto } from '../dtos/deposit/make-deposit.dto';
import { VerifyCardDto } from '../dtos/deposit/verify-card.dto';
import {
  ContributionResponseDto,
  CreditCardResourceResponseDto,
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
}
