import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';
import { GrpcSessionInterceptor } from './interceptors/grpc.interceptor';
import { JwtSessionInterceptor } from './interceptors/jwt.interceptor';
import { JwtSessionMiddleware } from './middleware/jwt.middleware';
import { RedisStore } from './redis.store';
import { SessionService } from './session.service';

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory(config: ConfigService<ConfigInterface>) {
        const { host, port } = config.get('redis', { infer: true });

        return { config: { host, port } };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [SessionService, RedisStore, JwtSessionInterceptor, GrpcSessionInterceptor, JwtSessionMiddleware],
  exports: [SessionService, JwtSessionMiddleware],
})
export class SessionModule {}
