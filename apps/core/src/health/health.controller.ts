import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { HealthCheckService, MicroserviceHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';
import * as Sentry from '@sentry/node';
import { ConfigInterface } from '~common/config/configuration';
import {
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
  HealthController as HealthControllerInterface,
  HealthControllerMethods,
} from '~common/grpc/interfaces/health';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';

@RpcController()
@HealthControllerMethods()
export class HealthController implements HealthControllerInterface {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
    private config: ConfigService<ConfigInterface>,
  ) {}

  async check(): Promise<HealthCheckResponse> {
    const redisAddr = this.config.get('redis', { infer: true });
    try {
      await this.health.check([
        () => this.db.pingCheck('database'),
        () =>
          this.microservice.pingCheck('redis', {
            transport: Transport.REDIS,
            options: redisAddr,
          }),
      ]);
    } catch (error) {
      Sentry.captureException(error);

      return { status: HealthCheckResponse_ServingStatus.NOT_SERVING };
    }

    return { status: HealthCheckResponse_ServingStatus.SERVING };
  }
}
