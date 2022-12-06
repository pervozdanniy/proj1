import { HttpException, Module } from '@nestjs/common';
import { UserModule } from './services/user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
@Module({
  imports: [UserModule],
  controllers: [],
  providers: [
    //{
    //   provide: APP_INTERCEPTOR,
    //   useFactory: () => new SentryInterceptor({
    //     filters: [{
    //       type: HttpException,
    //       filter: (exception: HttpException) => 500 > exception.getStatus() // Only report 500 errors
    //     }]
    //   }),
    // }
  ],
})
export class ApiGatewayModule {}
