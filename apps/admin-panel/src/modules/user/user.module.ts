import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '../../../../../common/grpc/helpers';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
