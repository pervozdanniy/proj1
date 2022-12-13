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
import { UserDTO } from '../dtos/user.dto';
import { CreateUserDto } from '../dtos/create.user.dto';
import { PaymentGatewayService } from '~common/grpc/interfaces/api-gateway/prime_trust';

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

  @ApiOperation({ summary: 'Create user.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user created successfully.',
    type: UserDTO,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUser(@Body() payload: CreateUserDto, @Res({ passthrough: true }) response: Response): Promise<UserDTO> {
    const user_id = 1;
    const request = { user_id, ...payload };
    console.log(response);

    return lastValueFrom(this.paymentGatewayService.createUser(request));
  }
}
