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
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionAuth, JwtSessionUser } from '~common/session';
import { PaymentGatewaysListDto } from '~svc/api-gateway/src/payment-gateway/dtos/payment-gateways-list.dto';
import { WithdrawalMakeDto } from '~svc/api-gateway/src/payment-gateway/dtos/withdrawal-make.dto';
import { WithdrawalParamsDto } from '~svc/api-gateway/src/payment-gateway/dtos/withdrawal-params.dto';
import { PaymentGatewayService } from '~svc/api-gateway/src/payment-gateway/services/payment-gateway.service';
import { SendDocumentDto } from '~svc/api-gateway/src/user/dtos/send-document.dto';
import { SendTokenDto } from '~svc/api-gateway/src/user/dtos/send-token.dto';

@ApiTags('Payment Gateway')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'payment_gateway',
})
export class PaymentGatewayController {
  private readonly logger = new Logger(PaymentGatewayController.name);
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  @ApiOperation({ summary: 'Get list of payment gateways' })
  @ApiResponse({ status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Get()
  async list(@Query() query: PaymentGatewaysListDto) {
    return this.paymentGatewayService.list(query);
  }

  @ApiOperation({ summary: 'Create User.' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.OK)
  @JwtSessionAuth()
  @Post('/user')
  async createUser(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.createUser(id);
  }

  @ApiOperation({ summary: 'Get Token.' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.OK)
  @JwtSessionAuth()
  @Post('/token')
  async getToken(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getToken(id);
  }

  @ApiOperation({ summary: 'Create Account.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/account')
  async createAccount(@JwtSessionUser() { id }: User, @Body() payload: SendTokenDto) {
    return this.paymentGatewayService.createAccount({ id, ...payload });
  }

  @Post('/account/webhook')
  async webhook(@Body() payload: any) {
    const { resource_type, action } = payload;
    const sendData = {
      id: payload['account-id'],
      resource_id: payload['resource_id'],
      payment_gateway: 'prime_trust',
    };
    const webhooks = [
      'aml-checks',
      'account-cash-transfers',
      'contacts',
      'contingent-holds',
      'disbursement-authorizations',
      'funds-transfers',
      'asset-transfers',
    ];

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

    const match = webhooks.find((e) => e === resource_type);
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
  async createContact(@JwtSessionUser() { id }: User, @Body() payload: SendTokenDto) {
    return this.paymentGatewayService.createContact({ id, ...payload });
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
    const { label, token } = payload;
    const tokenData = { id, token };

    return this.paymentGatewayService.uploadDocument({ file, label, tokenData });
  }

  @ApiOperation({ summary: 'Add Wire transfer reference.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/wire/reference')
  async createReference(@JwtSessionUser() { id }: User, @Body() payload: SendTokenDto) {
    return this.paymentGatewayService.createReference({ id, ...payload });
  }

  @ApiOperation({ summary: 'Add Wire transfer reference.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/balance')
  async getBalance(@JwtSessionUser() { id }: User, @Body() payload: SendTokenDto) {
    return this.paymentGatewayService.getBalance({ id, ...payload });
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
}