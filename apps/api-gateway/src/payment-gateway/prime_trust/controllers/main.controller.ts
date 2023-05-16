import { JwtSessionAuth, JwtSessionUser } from '@/auth';
import { PaymentGatewayService } from '@/payment-gateway/prime_trust/services/payment-gateway.service';
import {
  BalanceResponseDto,
  BankAccountParamsDto,
  BankAccountResponseDto,
  ExchangeResponseDto,
  TransactionResponseDto,
} from '@/payment-gateway/prime_trust/utils/prime-trust-response.dto';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { BalanceRequestDto } from '../dtos/main/balance.dto';
import { BankParamsDto } from '../dtos/main/bank-params.dto';
import { ExchangeDto } from '../dtos/main/exchange.dto';
import { GetTransfersDto } from '../dtos/transfer/get-transfers.dto';

@ApiTags('Payment Gateway')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'payment_gateway',
})
export class MainController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  @ApiOperation({ summary: 'Get Balance.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: BalanceResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Get('/balance')
  async getBalance(@Query() query: BalanceRequestDto, @JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getBalance(id, query.currencies);
  }

  @ApiOperation({ summary: 'Exchange course.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ExchangeResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Post('/exchange')
  async exchange(@Body() payload: ExchangeDto) {
    return this.paymentGatewayService.exchange(payload);
  }

  @ApiOperation({ summary: 'Get Banks information from user country.' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: BankAccountResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Get('/banks/available')
  async getBanksInfo(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getBanksInfo({ id });
  }

  @ApiOperation({ summary: 'Add Bank Account params.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: BankAccountParamsDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Post('/banks/account')
  async addBankAccountParams(@JwtSessionUser() { id }: User, @Body() payload: BankParamsDto) {
    return this.paymentGatewayService.addBankAccountParams({ id, ...payload });
  }

  @ApiOperation({ summary: 'Get all transactions.' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TransactionResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Get('/transactions')
  async getTransactions(@JwtSessionUser() { id }: User, @Query() query: GetTransfersDto) {
    return this.paymentGatewayService.getTransactions({ user_id: id, ...query });
  }

  @ApiOperation({ summary: 'Get available payment methods for current user.' })
  @ApiResponse({ type: [String] })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Get('/available_methods')
  async getAvailablePaymentMethods(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getAvailablePaymentMethods(id);
  }

  @ApiOperation({ summary: 'Transfer all accounts money to hot wallets.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Post('/hot_wallet')
  async transferToHotWallet() {
    return this.paymentGatewayService.transferToHotWallet();
  }
}
