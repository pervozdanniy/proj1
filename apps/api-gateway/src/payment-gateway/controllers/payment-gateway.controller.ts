import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { DocumentTypesEnum } from '~common/enum/document-types.enum';
import { InjectGrpc } from '~common/grpc/helpers';
import { User } from '~common/grpc/interfaces/common';
import { PaymentGatewayServiceClient } from '~common/grpc/interfaces/payment-gateway';
import { JwtSessionGuard, JwtSessionUser } from '~common/session';
import { HandlerService } from '~svc/api-gateway/src/payment-gateway/webhook/handlers/handler.service';
import { SendDocumentDto } from '~svc/api-gateway/src/user/dtos/send-document.dto';
import { SendTokenDto } from '~svc/api-gateway/src/user/dtos/send-token.dto';

@ApiTags('Payment Gateway')
@Injectable()
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'payment_gateway',
})
export class PaymentGatewayController implements OnModuleInit {
  @Inject(HandlerService)
  private handlerService: HandlerService;

  private paymentGatewayService: PaymentGatewayServiceClient;

  constructor(@InjectGrpc('core') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.paymentGatewayService = this.client.getService('PaymentGatewayService');
  }

  @ApiOperation({ summary: 'Get Token.' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtSessionGuard)
  @Post('/token')
  async getToken(@JwtSessionUser() { id }: User) {
    return lastValueFrom(this.paymentGatewayService.getToken({ id }));
  }

  @ApiOperation({ summary: 'Create Account.' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtSessionGuard)
  @Post('/account')
  async createAccount(@JwtSessionUser() { id }: User, @Body() payload: SendTokenDto) {
    return lastValueFrom(this.paymentGatewayService.createAccount({ id, ...payload }));
  }

  @Post('/account/webhook')
  async webhook(@Body() payload: any) {
    console.log(payload);

    return this.handlerService.handler(payload, this.paymentGatewayService);
  }

  @ApiOperation({ summary: 'Add New Contact.' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtSessionGuard)
  @Post('/kyc/contact')
  async createContact(@JwtSessionUser() { id }: User, @Body() payload: SendTokenDto) {
    return lastValueFrom(this.paymentGatewayService.createContact({ id, ...payload }));
  }

  @Post('kyc/upload-document')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload new file.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        label: {
          type: 'array',
          items: {
            enum: Object.values(DocumentTypesEnum),
            example: Object.values(DocumentTypesEnum),
          },
        },
        token: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The file successfully uploaded.',
  })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtSessionGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@JwtSessionUser() { id }: User, @UploadedFile() file: any, @Body() payload: SendDocumentDto) {
    const { label, token } = payload;
    const tokenData = { id, token };

    return lastValueFrom(this.paymentGatewayService.uploadDocument({ file, label, tokenData }));
  }

  @ApiOperation({ summary: 'Add Wire transfer reference.' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtSessionGuard)
  @Post('/wire/reference')
  async createReference(@JwtSessionUser() { id }: User, @Body() payload: SendTokenDto) {
    const response = await lastValueFrom(this.paymentGatewayService.createReference({ id, ...payload }));

    return { data: JSON.parse(response.data) };
  }
}
