import { Module } from '@nestjs/common';
import { AwsModule } from '~svc/core/src/api/aws/AwsModule';
import { CountryModule } from '~svc/core/src/api/country/country.module';
import { NotificationModule } from '~svc/core/src/api/notification/notification.module';
import { UserModule } from '~svc/core/src/api/user/user.module';

@Module({
  imports: [UserModule, AwsModule, CountryModule, NotificationModule],
})
export class CoreApiModule {}
