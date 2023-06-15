import { Module } from '@nestjs/common';
import { FeeAdminModule } from './fee.admin/fee.admin.module';
import { TransferAdminModule } from './transfer.admin/transfer.admin.module';
import { UserAdminModule } from './user.admin/user.admin.module';

@Module({
  imports: [UserAdminModule, TransferAdminModule, FeeAdminModule],
})
export class AdminPanelModule {}
