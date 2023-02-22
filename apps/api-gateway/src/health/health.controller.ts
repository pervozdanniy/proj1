import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { GRPCHealthIndicator, HealthCheckService, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { ConfigInterface } from '~common/config/configuration';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private grpc: GRPCHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
    private config: ConfigService<ConfigInterface>,
  ) {}

  @Get('/check')
  check() {
    const { auth, core } = this.config.get('grpcServices', { infer: true });
    const redis = this.config.get('redis', { infer: true });

    return this.health.check([
      () => this.grpc.checkService('auth', '', { url: `${auth.host}:${auth.port}` }),
      () => this.grpc.checkService('core', '', { url: `${core.host}:${core.port}` }),
      () =>
        this.microservice.pingCheck('redis', {
          transport: Transport.REDIS,
          options: redis,
        }),
    ]);
  }
}
