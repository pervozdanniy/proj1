import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { GrpcSessionModule } from '~common/grpc-session';
import { WebsocketController } from './websocket.controller';
import { WebsocketGateway } from './websocket.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService<ConfigInterface>) => ({
        secret: config.get('auth.jwt.secret', { infer: true }),
        signOptions: { expiresIn: '1y' },
      }),
      inject: [ConfigService],
    }),
    GrpcSessionModule,
  ],
  controllers: [WebsocketController],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}
