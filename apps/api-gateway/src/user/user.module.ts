import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigInterface } from '~common/config/configuration';
import { asyncClientOptions } from '~common/grpc/helpers';
import { JwtSessionMiddleware } from '~common/http-session';
import { AuthModule } from '../auth';
import { PaymentGatewayService } from '../payment-gateway/prime_trust/services/payment-gateway.service';
import { S3Service } from './services/s3.service';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';

@Module({
  imports: [HttpModule, ClientsModule.registerAsync([asyncClientOptions('core')]), AuthModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: S3Service,
      useFactory(config: ConfigService<ConfigInterface>) {
        return new S3Service(config.get('aws', { infer: true }));
      },
      inject: [ConfigService],
    },
    PaymentGatewayService,
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtSessionMiddleware).forRoutes(UserController);
  }
}
