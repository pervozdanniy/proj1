import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';
import { TelesignService } from '~svc/notifier/src/telesign/telesign.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (config: ConfigService<ConfigInterface>) => {
        const { customerId, apiKey } = config.get<ConfigInterface['telesign']>('telesign');

        return {
          baseURL: 'https://rest-api.telesign.com',
          auth: { username: customerId, password: apiKey },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [TelesignService],
  exports: [TelesignService],
})
export class TelesignModule {}
