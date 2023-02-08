import { JwtSessionAuth, JwtSessionUser } from '@/api/auth';
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
import { BankParamsDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/bank-params.dto';
import { PaymentGatewaysListDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/payment-gateways-list.dto';
import { SendDocumentDto } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/dtos/send-document.dto';
import { PaymentGatewayService } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/services/payment-gateway.service';
import { webhookData } from '~svc/api-gateway/src/api/payment-gateway/prime_trust/webhooks/data';

@ApiTags('Prime Trust')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'prime_trust',
})
export class MainController {
  private readonly logger = new Logger(MainController.name);
  constructor(@InjectRedis() private readonly redis: Redis, private paymentGatewayService: PaymentGatewayService) {}

  @ApiOperation({ summary: 'Get list of payment gateways' })
  @ApiResponse({ status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Get()
  async list(@Query() query: PaymentGatewaysListDto) {
    return this.paymentGatewayService.list(query);
  }

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

  @Post('/account/webhook')
  async webhook(@Body() payload: any) {
    const { resource_type, action } = payload;
    const sendData = {
      id: payload['account-id'],
      resource_id: payload['resource_id'],
      payment_gateway: 'prime_trust',
    };

    this.logger.log(payload);

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
      return this.paymentGatewayService.updateContribution(sendData);
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
}
