import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigInterface } from '~common/config/configuration';
import { asyncClientOptions } from '~common/grpc/helpers';
import { SessionModule } from '~common/session/session.module';
import { ApiSocialsService } from '~svc/auth/src/api/services/api.socials.service';
import { TwoFactorSettingsEntity } from '../entities/2fa_settings.entity';
import { TwoFactorController } from './controllers/2fa.controller';
import { AuthApiController } from './controllers/api.controller';
import { TwoFactorService } from './services/2fa.service';
import { AuthApiService } from './services/api.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TwoFactorSettingsEntity]),
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
  controllers: [AuthApiController, TwoFactorController],
  providers: [AuthApiService, ApiSocialsService, TwoFactorService],
  exports: [AuthApiService],
})
export class AuthApiModule {}
