import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Injectable,
  OnModuleInit,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { PaymentGatewayService } from '~common/grpc/interfaces/prime_trust';

@ApiTags('Payment Gateway')
@Injectable()
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
  @Post()
  async getToken(@Res({ passthrough: true }) response: Response) {
    const user_id = 1;

    return lastValueFrom(this.paymentGatewayService.getToken({ user_id }));
  }
}
