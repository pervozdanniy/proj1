import { Module } from '@nestjs/common';
import * as process from 'process';
import { ApiModule } from '~svc/api-gateway/src/api/api.module';
import { SdkModule } from '~svc/api-gateway/src/sdk/sdk.module';

@Module({
  imports: (() => {
    if (process.env.API_TYPE === 'SDK') {
      return [SdkModule];
    } else {
      return [ApiModule];
    }
  })(),
})
export class ApiGatewayModule {}
