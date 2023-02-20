import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import {
  GRPCHealthIndicator,
  HealthCheckService,
  MicroserviceHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import * as Sentry from '@sentry/node';
import { Addr, ConfigInterface } from '~common/config/configuration';
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
    private grpc: GRPCHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
    private config: ConfigService<ConfigInterface>,
  ) {}

  async check(): Promise<HealthCheckResponse> {
    const { host, port } = this.config.getOrThrow<Addr>('grpcServices.core', { infer: true });
    const redis = this.config.get('redis', { infer: true });
    try {
      await this.health.check([
        () => this.db.pingCheck('database'),
        () =>
          this.microservice.pingCheck('redis', {
            transport: Transport.REDIS,
            options: redis,
          }),
        () => this.grpc.checkService('core', '', { url: `${host}:${port}` }),
      ]);
    } catch (error) {
      Sentry.captureException(error);

      return { status: HealthCheckResponse_ServingStatus.NOT_SERVING };
    }

    return { status: HealthCheckResponse_ServingStatus.SERVING };
  }
}
