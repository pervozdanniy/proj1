import { Transform, Type } from 'class-transformer';
import { Column } from 'typeorm';
import { User } from '~common/grpc/interfaces/common';

export class AuthUserResponseDto implements User {
  id: number;
  username: string;
  email: string;
  phone: string;

  @Type(() => Date)
  @Transform(({ value }) => value?.toString(), { toClassOnly: true })
  email_verified_at?: string;

  @Type(() => Date)
  @Transform(({ value }) => value.toString(), { toClassOnly: true })
  created_at: string;

  @Type(() => Date)
  @Transform(({ value }) => value.toString(), { toClassOnly: true })
  updated_at: string;

  @Column('string')
  password: string;

  @Column('integer')
  country_id: number;
}
