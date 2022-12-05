import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from './user/entities/user.entity';
import { UserService } from './user/services/user.service';
import { UserController } from './user/controllers/user.controller';
import { migrations } from './user/db/migrations/getMigrations';

const entityList = [UserEntity];

const connectOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: entityList,
  migrations,
  migrationsRun: true,
};

@Module({
  imports: [
    TypeOrmModule.forRoot(connectOptions),
    TypeOrmModule.forFeature(entityList),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class CoreModule {}
