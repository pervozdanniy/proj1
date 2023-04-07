import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { GrpcSessionModule } from '~common/grpc-session';
import { asyncClientOptions } from '~common/grpc/helpers';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService<ConfigInterface>) => ({
        secret: config.get('auth.jwt.secret', { infer: true }),
        signOptions: { expiresIn: '1y' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([RefreshTokenEntity]),
    ClientsModule.registerAsync([asyncClientOptions('core'), asyncClientOptions('notifier')]),
    GrpcSessionModule,
  ],
  providers: [AuthService, TokenService],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
