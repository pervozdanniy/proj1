import dbConfig from '@/db/db.config';
import { UserContactEntity } from '@/user/entities/user-contact.entity';
import { UserDetailsEntity } from '@/user/entities/user-details.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from '~common/config/configuration';
import { UserAdminController } from './user.admin.controller';
import { UserAdminService } from './user.admin.service';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration, dbConfig], isGlobal: true }),
    TypeOrmModule.forFeature([UserEntity, UserContactEntity, UserDetailsEntity]),
  ],
  controllers: [UserAdminController],
  providers: [UserAdminService],
})
export class UserAdminModule {}
