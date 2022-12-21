import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Injectable,
  OnModuleInit,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { PaymentGatewayServiceClient } from '~common/grpc/interfaces/payment-gateway';
import { JwtSessionGuard, JwtSessionUser } from '~common/session';
import { User } from '~common/grpc/interfaces/common';
import { SendTokenDto } from '~svc/api-gateway/src/user/dtos/send-token.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SendDocumentDto } from '~svc/api-gateway/src/user/dtos/send-document.dto';
import { DocumentTypesEnum } from '~common/enum/document-types.enum';

@ApiTags('Payment Gateway')
@Injectable()
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'payment_gateway',
})
export class PaymentGatewayController implements OnModuleInit {
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

  @ApiOperation({ summary: 'Create Contact.' })
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
}
