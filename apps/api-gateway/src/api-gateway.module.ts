import { ApiModule } from '@/api/api.module';
import { SdkModule } from '@/sdk/sdk.module';
import { Module } from '@nestjs/common';
import * as process from 'process';
import { HealthModule } from './health/health.module';

@Module({
  imports: (() => {
    if (process.env.NODE_ENV === 'dev') {
      return [SdkModule, ApiModule, HealthModule];
    }
    if (process.env.API_TYPE === 'SDK') {
      return [SdkModule, HealthModule];
    } else {
      return [ApiModule, HealthModule];
    }
  })(),
})
export class ApiGatewayModule {}
