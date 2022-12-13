import { Controller, UseFilters } from '@nestjs/common';
import { TypeOrmExceptionFilter } from '~common/filters/type-orm-exception.filter';
import { CreateUserDto } from '~svc/core/src/payment-gateway/dto/create.user.dto';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
@UseFilters(TypeOrmExceptionFilter)
export class PaymentGatewayController {
  @GrpcMethod('PaymentGatewayService', 'CreateUser')
  async createUser(request: CreateUserDto) {
    console.log(request);
  }
}
