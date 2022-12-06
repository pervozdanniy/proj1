import {  Module } from '@nestjs/common';
import { UserModule } from './services/user/user.module';
@Module({
  imports: [UserModule],
  controllers: [],
  providers: [],
})
export class ApiGatewayModule {}
