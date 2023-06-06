import { Module } from '@nestjs/common';
import { TransferAdminModule } from './transfer.admin/transfer.admin.module';
import { UserAdminModule } from './user.admin/user.admin.module';

@Module({
  imports: [UserAdminModule, TransferAdminModule],
})
export class AdminPanelModule {}
