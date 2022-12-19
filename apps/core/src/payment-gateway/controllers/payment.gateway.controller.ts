import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { PaymentGatewayService } from '../services/payment.gateway.service';
import { GetTokenRequest, PaymentGatewayControllerMethods } from '~common/grpc/interfaces/prime_trust';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { TypeOrmExceptionFilter } from '~common/utils/filters/type-orm-exception.filter';
import { CreateRequestDto } from '~svc/core/src/user/dto/create.request.dto';
import { User } from '~common/grpc/interfaces/common';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '~svc/core/src/user/dto/user.response.dto';
import { GrpcMethod } from '@nestjs/microservices';

@RpcController()
@UseFilters(TypeOrmExceptionFilter)
@PaymentGatewayControllerMethods()
export class PaymentGatewayController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  async getToken(request: GetTokenRequest) {
    return this.paymentGatewayService.getToken(request);
  }

  @GrpcMethod('UserService', 'Create')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(payload: CreateRequestDto): Promise<User> {
    const user = this.paymentGatewayService.createUser(payload);

    return plainToInstance(UserResponseDto, user);
  }
}
