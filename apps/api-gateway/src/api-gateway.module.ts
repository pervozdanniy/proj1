import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import configuration from '~common/config/configuration';
import { CountryModule } from '~svc/api-gateway/src/country/country.module';
import { NotificationModule } from '~svc/api-gateway/src/notification/notification.module';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';
import { UserModule } from './user/user.module';

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
    AuthModule,
    ClientModule,
    CountryModule,
    NotificationModule,
  ],
})
export class ApiGatewayModule {}
