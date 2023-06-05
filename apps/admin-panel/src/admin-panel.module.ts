import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../../common/config/configuration';
import dbConfig from './db/config/db.config';
import { DatabaseModule } from './db/database.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration, dbConfig], isGlobal: true }),
    DatabaseModule,
    AdminModule,
    AuthModule,
    UserModule,
  ],
})
export class AdminPanelModule {
  static port: number;
  static apiVersion: string;
  static apiPrefix: string;

  constructor(private readonly configService: ConfigService) {
    AdminPanelModule.port = +this.configService.get('admin_panel.port', { infer: true });
    AdminPanelModule.apiVersion = this.configService.get('admin_panel.api_version', { infer: true });
    AdminPanelModule.apiPrefix = this.configService.get('admin_panel.api_prefix', { infer: true });
  }
}
