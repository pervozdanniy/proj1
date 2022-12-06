import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { UserController } from './controllers/user.controller';
import { asyncClientOptions } from 'common/utils/grpc.util';
@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [UserController],
})
export class UserModule {}
