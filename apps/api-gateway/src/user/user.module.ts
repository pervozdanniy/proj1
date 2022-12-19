import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
<<<<<<< HEAD
=======
import { RegisterController } from './controllers/register.contoller';
>>>>>>> 492ba48 (SKOPA-99: added integration tests)
import { UserController } from './controllers/user.controller';
import { UserService } from './user.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
