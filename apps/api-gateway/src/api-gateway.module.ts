import { Module } from '@nestjs/common';
import { UserModule } from './services/user/user.module';
import {LoggerModule} from "nestjs-pino";
@Module({
  imports: [LoggerModule.forRoot({
    pinoHttp: {
      transport: {
        target: 'pino-pretty',
        options: {
          singleLine: true,
          colorize: true,
          ignore:'time,hostname,req.headers.res.headers',
          errorLikeObjectKeys: ['err','error'],
          customColors: 'err:red,error:red,info:blue',
        }
      },
    }
  }),
      UserModule],
  controllers: [],
  providers: [],
})
export class ApiGatewayModule {}
