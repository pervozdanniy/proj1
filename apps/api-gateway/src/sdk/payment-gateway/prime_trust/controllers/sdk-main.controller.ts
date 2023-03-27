import {} from '@/api/payment-gateway/prime_trust/utils/prime-trust-response.dto';
import { SdkPaymentGatewayService } from '@/sdk/payment-gateway/prime_trust/services/sdk-payment-gateway.service';
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
import { JwtSessionAuth, JwtSessionUser } from '~common/http-session';
import { BalanceRequestDto } from '../dtos/main/balance.dto';
import { BankParamsDto } from '../dtos/main/bank-params.dto';
import { SendDocumentDto } from '../dtos/main/send-document.dto';
import { GetTransfersDto } from '../dtos/transfer/get-transfers.dto';
import {
  AccountResponseDto,
  BalanceResponseDto,
  BankAccountParamsDto,
  BankAccountResponseDto,
  ContactResponseDto,
  DocumentResponseDto,
  TokenDto,
  TransactionResponseDto,
} from '../utils/prime-trust-response.dto';

@ApiTags('SDK/Prime Trust')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'sdk/prime_trust',
})
export class SdkMainController {
  constructor(@InjectRedis() private readonly redis: Redis, private paymentGatewayService: SdkPaymentGatewayService) {}

  @ApiOperation({ summary: 'Get Token.' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TokenDto,
  })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @JwtSessionAuth({ requireActive: true })
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
  @JwtSessionAuth({ requireActive: true })
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
  @JwtSessionAuth({ requireActive: true })
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
  @JwtSessionAuth({ requireActive: true })
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
  @JwtSessionAuth({ requireActive: true })
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
  @JwtSessionAuth({ requireActive: true })
  @Get('/balance')
  async getBalance(@Query() query: BalanceRequestDto, @JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getBalance(id, query.currencies);
  }

  @ApiOperation({ summary: 'Get Bank Accounts.' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: BankAccountResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth({ requireActive: true })
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
  @JwtSessionAuth({ requireActive: true })
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
  @JwtSessionAuth({ requireActive: true })
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
  @JwtSessionAuth({ requireActive: true })
  @Get('/transactions')
  async getTransactions(@JwtSessionUser() { id }: User, @Query() query: GetTransfersDto) {
    return this.paymentGatewayService.getTransactions({ user_id: id, ...query });
  }
}
