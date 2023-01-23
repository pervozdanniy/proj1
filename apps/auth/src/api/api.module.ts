import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { asyncClientOptions } from '~common/grpc/helpers';
import { SessionModule } from '~common/session/session.module';
import { ApiSocialsService } from '~svc/auth/src/api/services/api.socials.service';
import { Auth2FAModule } from '../auth-2fa/2fa.module';
import { AuthModule } from '../auth/auth.module';
import { TwoFactorController } from './controllers/2fa.controller';
import { AuthApiController } from './controllers/api.controller';
import { AuthApiService } from './services/api.service';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')]), SessionModule, AuthModule, Auth2FAModule],
  controllers: [AuthApiController, TwoFactorController],
  providers: [AuthApiService, ApiSocialsService],
})
export class AuthApiModule {}
