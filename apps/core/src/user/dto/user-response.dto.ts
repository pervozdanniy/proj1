import { Transform, Type } from 'class-transformer';
import { User, UserAgreement } from '~common/grpc/interfaces/common';
import { UserDetailsDto } from './user-request.dto';

export class UserResponseDto implements User {
  id: number;
  email: string;
  phone: string;
  password: string;
  country_code: string;

  @Type(() => Date)
  @Transform(({ value }) => value?.toString(), { toClassOnly: true })
  email_verified_at?: string;

  @Type(() => Date)
  @Transform(({ value }) => value.toString(), { toClassOnly: true })
  created_at: string;

  @Type(() => Date)
  @Transform(({ value }) => value.toString(), { toClassOnly: true })
  updated_at: string;

  @Type(() => UserResponseDto)
  contacts: User[];

  agreement: UserAgreement;

  @Type(() => UserDetailsDto)
  details?: UserDetailsDto;
}
