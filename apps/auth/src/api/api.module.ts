import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { GrpcSessionModule } from '~common/grpc-session';
import { asyncClientOptions } from '~common/grpc/helpers';
import { Auth2FAModule } from '../auth-2fa/2fa.module';
import { AuthModule } from '../auth/auth.module';
import { TwoFactorController } from './controllers/2fa.controller';
import { AuthApiController } from './controllers/api.controller';
import { AuthApiService } from './services/api.service';
import { ApiSocialsService } from './services/api.socials.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')]), GrpcSessionModule, AuthModule, Auth2FAModule],
  controllers: [AuthApiController, TwoFactorController],
  providers: [AuthApiService, ApiSocialsService],
})
export class AuthApiModule {}
