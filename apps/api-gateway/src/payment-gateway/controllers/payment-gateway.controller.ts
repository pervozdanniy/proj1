import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  OnModuleInit,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { User } from '~common/grpc/interfaces/common';
import { PaymentGatewayServiceClient } from '~common/grpc/interfaces/payment-gateway';
import { JwtSessionGuard, JwtSessionUser } from '~common/session';
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
export class PaymentGatewayController implements OnModuleInit {
  private paymentGatewayServiceClient: PaymentGatewayServiceClient;

  constructor(
    @InjectGrpc('core') private readonly client: ClientGrpc,
    private paymentGatewayService: PaymentGatewayService,
  ) {}

  onModuleInit() {
    this.paymentGatewayServiceClient = this.client.getService('PaymentGatewayService');
  }

  @ApiOperation({ summary: 'Get Token.' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtSessionGuard)
  @Post('/token')
  async getToken(@JwtSessionUser() { id }: User) {
    return lastValueFrom(this.paymentGatewayServiceClient.getToken({ id }));
  }

  @ApiOperation({ summary: 'Create Account.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @UseGuards(JwtSessionGuard)
  @Post('/account')
  async createAccount(@JwtSessionUser() { id }: User, @Body() payload: SendTokenDto) {
    return lastValueFrom(this.paymentGatewayServiceClient.createAccount({ id, ...payload }));
  }

  @Post('/account/webhook')
  async webhook(@Body() payload: any) {
    const { resource_type, action } = payload;
    const id: string = payload['account-id'];
    const sendData = { id, payment_gateway: 'prime_trust' };
    if (resource_type === 'accounts' && action === 'update') {
      return this.paymentGatewayService.updateAccount(this.paymentGatewayServiceClient, sendData);
    } else if (resource_type === 'kyc_document_checks' && action === 'update') {
      return this.paymentGatewayService.documentCheck(this.paymentGatewayServiceClient, sendData);
    } else if (resource_type === 'funds_transfers' && action === 'update') {
      return this.paymentGatewayService.updateBalance(this.paymentGatewayServiceClient, sendData);
    }
  }

  @ApiOperation({ summary: 'Add New Contact.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @UseGuards(JwtSessionGuard)
  @Post('/kyc/contact')
  async createContact(@JwtSessionUser() { id }: User, @Body() payload: SendTokenDto) {
    return lastValueFrom(this.paymentGatewayServiceClient.createContact({ id, ...payload }));
  }

  @Post('kyc/upload-document')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload new file.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The file successfully uploaded.',
  })
  @UseGuards(JwtSessionGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@JwtSessionUser() { id }: User, @UploadedFile() file: any, @Body() payload: SendDocumentDto) {
    const { label, token } = payload;
    const tokenData = { id, token };

    return lastValueFrom(this.paymentGatewayServiceClient.uploadDocument({ file, label, tokenData }));
  }

  @ApiOperation({ summary: 'Add Wire transfer reference.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @UseGuards(JwtSessionGuard)
  @Post('/wire/reference')
  async createReference(@JwtSessionUser() { id }: User, @Body() payload: SendTokenDto) {
    const response = await lastValueFrom(this.paymentGatewayServiceClient.createReference({ id, ...payload }));

    return { data: JSON.parse(response.data) };
  }

  @ApiOperation({ summary: 'Add Wire transfer reference.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @UseGuards(JwtSessionGuard)
  @Post('/balance')
  async getBalance(@JwtSessionUser() { id }: User, @Body() payload: SendTokenDto) {
    return lastValueFrom(this.paymentGatewayServiceClient.getBalance({ id, ...payload }));
  }
}
