import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { UserController } from './controllers/user.controller';
import { getGrpcClientOptions } from 'common/utils/grpc.util';

@Module({
  imports: [
    ClientsModule.register([
      getGrpcClientOptions('user', 'core', 'core_service'),
    ]),
  ],
  controllers: [UserController],
})
export class UserModule {}
