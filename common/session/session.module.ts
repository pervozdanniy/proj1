import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';
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
  providers: [
    RedisStore,
    {
      provide: SessionService,
      useFactory(store: RedisStore, config: ConfigService<ConfigInterface>) {
        const maxAge = config.get('auth.jwt.refreshTokenTtl', { infer: true });

        return new SessionService(store, { maxAge });
      },
      inject: [RedisStore, ConfigService],
    },
  ],
  exports: [SessionService],
})
export class SessionModule {}
