import { Exclude } from 'class-transformer';
import { User } from '~common/grpc/interfaces/common';

export class MeResponseDto implements User {
  id: number;
  username: string;
  email: string;
  @Exclude()
  password: string;
  created_at: string;
  updated_at: string;
  phone?: string;
  email_verified_at?: string;
}
