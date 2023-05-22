import { AdminModule } from '@admin/admin.module';
import { AuthModule } from '@modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../../common/config/configuration';
import coreDbConfig from './db/config/core-db.config';
import dbConfig from './db/config/db.config';
import { DatabaseModule } from './db/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration, dbConfig, coreDbConfig], isGlobal: true }),
    DatabaseModule,
    AdminModule,
    AuthModule,
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
