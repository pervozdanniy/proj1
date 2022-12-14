import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';
import { JwtSessionStrategy } from './guards/jwt/jwt.strategy';
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
  providers: [SessionService, RedisStore, JwtSessionStrategy],
  exports: [SessionService, JwtSessionStrategy],
})
export class SessionModule {}
