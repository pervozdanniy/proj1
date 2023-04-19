import { JwtSessionAuth, JwtSessionUser } from '@/api/auth';
import { PaymentGatewayService } from '@/api/payment-gateway/prime_trust/services/payment-gateway.service';
import {
  AccountResponseDto,
  BalanceResponseDto,
  BankAccountParamsDto,
  BankAccountResponseDto,
  ContactResponseDto,
  DocumentResponseDto,
  ExchangeResponseDto,
  TokenDto,
  TransactionResponseDto,
} from '@/api/payment-gateway/prime_trust/utils/prime-trust-response.dto';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import Redis from 'ioredis';
import { User } from '~common/grpc/interfaces/common';
import { BalanceRequestDto } from '../dtos/main/balance.dto';
import { BankParamsDto } from '../dtos/main/bank-params.dto';
import { ExchangeDto } from '../dtos/main/exchange.dto';
import { SendDocumentDto } from '../dtos/main/send-document.dto';
import { SocureDocumentDto } from '../dtos/main/socure.document.dto';
import { GetTransfersDto } from '../dtos/transfer/get-transfers.dto';

@ApiTags('Prime Trust')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'prime_trust',
})
export class MainController {
  constructor(@InjectRedis() private readonly redis: Redis, private paymentGatewayService: PaymentGatewayService) {}

  @ApiOperation({ summary: 'Get Token.' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TokenDto,
  })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Post('/token')
  async getToken() {
    const {
      data: { token },
    } = await this.paymentGatewayService.getToken();
    await this.redis.set('prime_token', token);

    return { token };
  }

  @ApiOperation({ summary: 'Create Account.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Post('/account')
  async createAccount(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.createAccount({ id });
  }

  //not necessary yet

  // @ApiOperation({ summary: 'Add New Contact.' })
  // @ApiResponse({
  //   status: HttpStatus.CREATED,
  // })
  // @JwtSessionAuth()
  // @Post('/contact')
  // async createContact(@JwtSessionUser() { id }: User) {
  //   return this.paymentGatewayService.createContact({ id });
  // }

  @ApiOperation({ summary: 'Get Account.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AccountResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Get('/account')
  async getAccount(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getAccount({ id });
  }

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

  @Post('/kyc/upload-document')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload new file.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The file successfully uploaded.',
    type: DocumentResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @JwtSessionUser() { id }: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() payload: SendDocumentDto,
  ) {
    const { label } = payload;

    return this.paymentGatewayService.uploadDocument({ file, label, userId: { id } });
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

  @ApiOperation({ summary: 'Get Bank Accounts.' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: BankAccountResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Get('/bank/account')
  async getBankAccounts(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getBankAccounts({ id });
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

  @ApiOperation({ summary: 'Get available payment methods for current user.' })
  @ApiResponse({ type: [String] })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Get('/available-methods')
  async getAvailablePaymentMethods(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getAvailablePaymentMethods(id);
  }

  @ApiOperation({ summary: 'Create socure document.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post('/create/socure/document')
  async createSocureDocument(@Body() payload: SocureDocumentDto) {
    return this.paymentGatewayService.createSocureDocument(payload);
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
