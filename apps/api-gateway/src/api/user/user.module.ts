import { S3, S3Client } from '@aws-sdk/client-s3';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigInterface } from '~common/config/configuration';
import { asyncClientOptions } from '~common/grpc/helpers';
import { JwtSessionMiddleware } from '~common/http-session';
import { AuthModule } from '../auth';
import { S3Service } from './services/s3.service';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';

@Module({
  imports: [ClientsModule.registerAsync([asyncClientOptions('core')]), AuthModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: S3Service,
      useFactory(config: ConfigService<ConfigInterface>) {
        const { region, credentials, s3 } = config.get('aws', { infer: true });
        const client = new S3Client({ region, credentials, endpoint: s3.url, forcePathStyle: true });

        return new S3Service(client, s3.bucket);
      },
      inject: [ConfigService],
    },
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtSessionMiddleware).forRoutes(UserController);
  }
}
