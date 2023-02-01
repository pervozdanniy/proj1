import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';
import { SlickTextService } from './slicktext.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (config: ConfigService<ConfigInterface>) => {
        const { pubKey, privKey } = config.get<ConfigInterface['slicktext']>('slicktext');

        return {
          baseURL: 'https://api.slicktext.com/v1/',
          auth: { username: pubKey, password: privKey },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [SlickTextService],
  exports: [SlickTextService],
})
export class SlickTextModule {}
