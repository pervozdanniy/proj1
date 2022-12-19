import {
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
import { PaymentGatewayService } from '~common/grpc/interfaces/prime_trust';
import { JwtSessionGuard, JwtSessionUser } from '~common/session';
import { User } from '~common/grpc/interfaces/common';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Payment Gateway')
@Injectable()
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'payment_gateway',
})
export class PaymentGatewayController implements OnModuleInit {
  private paymentGatewayService: PaymentGatewayService;

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
  @Post()
  async getToken(@JwtSessionUser() { id }: User) {
    const user_id = id;

    return lastValueFrom(this.paymentGatewayService.getToken({ user_id }));
  }

  @Post('kyc/upload-document')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload new file.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {}


}
