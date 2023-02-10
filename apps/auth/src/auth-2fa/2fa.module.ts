import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrpcSessionModule } from '~common/grpc-session';
import { asyncClientOptions } from '~common/grpc/helpers';
import { AuthModule } from '../auth/auth.module';
import { TwoFactorSettingsEntity } from '../entities/2fa_settings.entity';
import { Auth2FAService } from './2fa.service';
import { Notifier2FAService } from './notifier.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TwoFactorSettingsEntity]),
    ClientsModule.registerAsync([asyncClientOptions('notifier')]),
    AuthModule,
    GrpcSessionModule,
  ],
  providers: [Auth2FAService, Notifier2FAService],
  exports: [Auth2FAService],
})
export class Auth2FAModule {}
