import { TransferFundsResponseDTO } from '@/api/payment-gateway/prime_trust/utils/prime-trust-response.dto';
import { SdkPaymentGatewayService } from '@/sdk/payment-gateway/prime_trust/services/sdk-payment-gateway.service';
import { webhookData } from '@/sdk/payment-gateway/prime_trust/webhooks/data';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
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
import { BankParamsDto } from '../dtos/main/bank-params.dto';
import { SendDocumentDto } from '../dtos/main/send-document.dto';
import { GetTransfersDto } from '../dtos/transfer/get-transfers.dto';

@ApiTags('SDK/Prime Trust')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'sdk/prime_trust',
})
export class SdkMainController {
  private readonly logger = new Logger(SdkMainController.name);
  constructor(@InjectRedis() private readonly redis: Redis, private paymentGatewayService: SdkPaymentGatewayService) {}

  @ApiOperation({ summary: 'Get Token.' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.OK)
  @JwtSessionAuth()
  @Post('/token')
  async getToken(@JwtSessionUser() { id }: User) {
    const {
      data: { token },
    } = await this.paymentGatewayService.getToken(id);
    await this.redis.set('prime_token', token);

    return { token };
  }

  @ApiOperation({ summary: 'Create Account.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/account')
  async createAccount(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.createAccount({ id });
  }

  @ApiOperation({ summary: 'Get Account.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Get('/account')
  async getAccount(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getAccount({ id });
  }

  @ApiOperation({ summary: 'Get Contact.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Get('/contact')
  async getContact(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getContact({ id });
  }
  @Post('/account/webhook')
  async webhook(@Body() payload: any) {
    const {
      resource_type,
      action,
      data: { changes },
    } = payload;

    const sendData = {
      id: payload['account-id'],
      resource_id: payload['resource_id'],
      payment_gateway: 'prime_trust',
    };

    if (resource_type === 'accounts' && action === 'update') {
      return this.paymentGatewayService.updateAccount(sendData);
    }
    if (resource_type === 'kyc_document_checks' && action === 'update') {
      return this.paymentGatewayService.documentCheck(sendData);
    }
    if (resource_type === 'cip_checks' && action === 'update') {
      return this.paymentGatewayService.cipCheck(sendData);
    }
    if (resource_type === 'contributions' && action === 'update') {
      const paramsToCheck = ['amount', 'payment-details', 'status'];
      const allParamsExist = paramsToCheck.every((param) => changes.includes(param));
      if (allParamsExist) {
        return this.paymentGatewayService.updateContribution(sendData);
      }
    }
    if (resource_type === 'funds_transfers' && action === 'update') {
      return this.paymentGatewayService.updateBalance(sendData);
    }
    if (resource_type === 'disbursements' && action === 'update') {
      return this.paymentGatewayService.updateWithdraw(sendData);
    }

    const match = webhookData.find((e) => e === resource_type);
    if (!match) {
      this.logger.error(`Webhook ${resource_type} not found!`);
    }
  }

  @ApiOperation({ summary: 'Add New Contact.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/contact')
  async createContact(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.createContact({ id });
  }

  @Post('kyc/upload-document')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload new file.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The file successfully uploaded.',
  })
  @JwtSessionAuth()
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@JwtSessionUser() { id }: User, @UploadedFile() file: any, @Body() payload: SendDocumentDto) {
    const { label } = payload;

    return this.paymentGatewayService.uploadDocument({ file, label, userId: { id } });
  }

  @ApiOperation({ summary: 'Get Balance.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/balance')
  async getBalance(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getBalance({ id });
  }

  @ApiOperation({ summary: 'Get Bank Accounts.' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @JwtSessionAuth()
  @Get('/bank/account')
  async getBankAccounts(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getBankAccounts({ id });
  }
  @ApiOperation({ summary: 'Add Bank Account params.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/bank/account')
  async addBankAccountParams(@JwtSessionUser() { id }: User, @Body() payload: BankParamsDto) {
    return this.paymentGatewayService.addBankAccountParams({ id, ...payload });
  }

  @ApiOperation({ summary: 'Get all transactions.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: TransferFundsResponseDTO,
  })
  @JwtSessionAuth()
  @Get('/transactions')
  async getTransactions(@JwtSessionUser() { id }: User, @Query() query: GetTransfersDto) {
    return this.paymentGatewayService.getTransactions({ user_id: id, ...query });
  }
}
