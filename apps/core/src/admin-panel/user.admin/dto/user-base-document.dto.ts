import { Transform, Type } from 'class-transformer';
import { UserBase } from '~common/grpc/interfaces/admin_panel';

export class UserBaseDocumentDto implements UserBase {
  id: number;
  email: string;
  country_code: string;
  phone: string;
  status: string;

  @Type(() => Date)
  @Transform(({ value }) => value?.toString(), { toClassOnly: true })
  email_verified_at?: string;

  @Type(() => Date)
  @Transform(({ value }) => value.toString(), { toClassOnly: true })
  created_at: string;

  @Type(() => Date)
  @Transform(({ value }) => value.toString(), { toClassOnly: true })
  updated_at: string;

  source: string;
}
