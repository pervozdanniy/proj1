import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigInterface } from '~common/config/configuration';
import { asyncClientOptions } from '~common/grpc/helpers';
import { SessionModule } from '~common/session/session.module';
import { AuthApiController } from './api.controller';
import { AuthApiService } from './api.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService<ConfigInterface>) => ({
        secret: config.get('auth.jwt.secret', { infer: true }),
        signOptions: { expiresIn: '1y' },
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([asyncClientOptions('core')]),
    SessionModule,
  ],
  controllers: [AuthApiController],
  providers: [AuthApiService],
  exports: [AuthApiService],
})
export class AuthApiModule {}
