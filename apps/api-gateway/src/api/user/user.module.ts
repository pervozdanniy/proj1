import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { JwtSessionMiddleware } from '~common/session';
import { AuthModule } from '../auth';
import { UserController } from './controllers/user.controller';
import { UserService } from './user.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')]), AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtSessionMiddleware).forRoutes(UserController);
  }
}
