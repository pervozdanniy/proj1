import { ApiModule } from '@/api/api.module';
import { SdkModule } from '@/sdk/sdk.module';
import { Module } from '@nestjs/common';
import * as process from 'process';

@Module({
  imports: (() => {
    if (process.env.NODE_ENV === 'dev') {
      return [SdkModule, ApiModule];
    }
    if (process.env.API_TYPE === 'SDK') {
      return [SdkModule];
    } else {
      return [ApiModule];
    }
  })(),
})
export class ApiGatewayModule {}
