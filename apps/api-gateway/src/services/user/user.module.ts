import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { UserController } from './controllers/user.controller';
import { getGrpcClientOptions } from '~command/utils/grpc.util';

@Module({
  imports: [
    ClientsModule.register([
      getGrpcClientOptions(__dirname, 'user', 'core', 'core_service'),
    ]),
  ],
  controllers: [UserController],
})
export class UserModule {}
