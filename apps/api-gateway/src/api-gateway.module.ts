import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '~common/config/configuration';
import { UserModule } from './user/user.module';
import { LoggerModule } from 'nestjs-pino';
import { PaymentGatewayModule } from './payment-gateway/payment.gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            colorize: true,
            ignore: 'time,hostname,req.headers.res.headers',
            errorLikeObjectKeys: ['err', 'error'],
            customColors: 'err:red,error:red,info:blue',
          },
        },
      },
    }),
    UserModule,
    PaymentGatewayModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiGatewayModule {}
