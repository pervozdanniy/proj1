import { Transform, Type } from 'class-transformer';
import { User } from '~common/grpc/interfaces/common';

export class UserResponseDto implements User {
  id: number;
  username: string;
  email: string;
  phone: string;
  password: string;

  @Type(() => Date)
  @Transform(({ value }) => value?.toString(), { toClassOnly: true })
  email_verified_at?: string;

  @Type(() => Date)
  @Transform(({ value }) => value.toString(), { toClassOnly: true })
  created_at: string;

  @Type(() => Date)
  @Transform(({ value }) => value.toString(), { toClassOnly: true })
  updated_at: string;
}
