import { Module } from '@nestjs/common';
import { UserAdminModule } from './user.admin/user.admin.module';

@Module({
  imports: [UserAdminModule],
})
export class AdminPanelModule {}
