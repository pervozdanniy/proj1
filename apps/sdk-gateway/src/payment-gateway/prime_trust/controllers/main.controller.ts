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
import { JwtSessionAuth, JwtSessionUser } from '~common/http-session';
import { PaymentGatewayService } from '~svc/sdk-gateway/src/payment-gateway/prime_trust/services/payment-gateway.service';
import { BalanceRequestDto } from '../dtos/main/balance.dto';
import { BankParamsDto } from '../dtos/main/bank-params.dto';
import { GetTransfersDto } from '../dtos/transfer/get-transfers.dto';
import {
  BalanceResponseDto,
  BankAccountParamsDto,
  BankAccountResponseDto,
  ContactResponseDto,
  TransactionResponseDto,
} from '../utils/prime-trust-response.dto';

@ApiTags('Prime Trust')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'prime_trust',
})
export class MainController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}
  @ApiOperation({ summary: 'Get Contact.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ContactResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Get('/contact')
  async getContact(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getContact({ id });
  }

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

  @ApiOperation({ summary: 'Get Banks information from user country.' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: BankAccountResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Get('/available/banks')
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
  @Post('/bank/account')
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
}
