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
import { JwtSessionAuth, JwtSessionUser } from '~common/session';
import { CardResourceDto } from '~svc/api-gateway/src/api/payment-gateway/dtos/card-resource.dto';
import { PaymentGatewaysListDto } from '~svc/api-gateway/src/api/payment-gateway/dtos/payment-gateways-list.dto';
import { SendDocumentDto } from '~svc/api-gateway/src/api/payment-gateway/dtos/send-document.dto';
import { TransferFundsDto } from '~svc/api-gateway/src/api/payment-gateway/dtos/transfer-funds.dto';
import { WithdrawalMakeDto } from '~svc/api-gateway/src/api/payment-gateway/dtos/withdrawal-make.dto';
import { WithdrawalParamsDto } from '~svc/api-gateway/src/api/payment-gateway/dtos/withdrawal-params.dto';
import { PaymentGatewayService } from '~svc/api-gateway/src/api/payment-gateway/services/payment-gateway.service';
import { webhookData } from '~svc/api-gateway/src/api/payment-gateway/webhooks/data';

@ApiTags('Payment Gateway')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'payment_gateway',
})
export class PaymentGatewayController {
  private readonly logger = new Logger(PaymentGatewayController.name);
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
    console.log(payload);

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
  @Post('/kyc/contact')
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

  @ApiOperation({ summary: 'Add Wire transfer reference.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/wire/reference')
  async createReference(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.createReference({ id });
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

  @ApiOperation({ summary: 'Get Bank params for withdrawal.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Get('/withdrawal/params')
  async getWithdrawalParams(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getWithdrawalParams({ id });
  }

  @ApiOperation({ summary: 'Add Bank params for withdrawal.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/withdrawal/params')
  async addWithdrawalParams(@JwtSessionUser() { id }: User, @Body() payload: WithdrawalParamsDto) {
    return this.paymentGatewayService.addWithdrawalParams({ id, ...payload });
  }

  @ApiOperation({ summary: 'Make withdrawal.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/withdrawal/make')
  async makeWithdrawal(@JwtSessionUser() { id }: User, @Body() payload: WithdrawalMakeDto) {
    return this.paymentGatewayService.makeWithdrawal({ id, ...payload });
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
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Get('/credit_cards')
  async getCreditCards(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getCreditCards({ id });
  }

  @ApiOperation({ summary: 'Verify Credit Card.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/transfer/funds')
  async transferFunds(@JwtSessionUser() { id }: User, @Body() payload: TransferFundsDto) {
    return this.paymentGatewayService.transferFunds({ sender_id: id, ...payload });
  }
}
