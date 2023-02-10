import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigInterface } from '~common/config/configuration';
import { GrpcSessionModule } from '~common/grpc-session';
import { asyncClientOptions } from '~common/grpc/helpers';
import { AuthService } from './auth.service';

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
    GrpcSessionModule,
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
