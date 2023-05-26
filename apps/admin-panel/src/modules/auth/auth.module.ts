import { UsersModule } from '@admin/access/users/users.module';
import { JwtRefreshStrategy } from '@modules/auth/jwt-refresh.strategy';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtAuthGuard, PermissionsGuard } from './guards';
import { JwtStrategy } from './jwt.strategy';
import { AuthService, TokenService } from './services';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('admin_panel.token_secret', { infer: true }),
        signOptions: {
          expiresIn: config.get('admin_panel.access_token_ttl', { infer: true }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    TokenService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [JwtStrategy, PassportModule, TokenService, AuthService, JwtRefreshStrategy],
})
export class AuthModule {}
