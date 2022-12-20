import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { UserController } from './controllers/user.controller';
import { asyncClientOptions } from '~common/grpc/helpers';
import { UserService } from './user.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core'), asyncClientOptions('auth')])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
