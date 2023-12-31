import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { User, UserAgreement, UserDetails, UserDocument } from '~common/grpc/interfaces/common';

export class PublicUserDto implements User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @Exclude()
  password: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  phone?: string;

  @ApiProperty()
  email_verified_at?: string;

  @ApiProperty()
  details?: UserDetails;

  @Exclude()
  source: string;

  @ApiProperty()
  country_code: string;

  contacts: User[];

  status?: string;
  agreement?: UserAgreement;
  @Exclude()
  social_id?: string;
  @Exclude()
  documents: UserDocument[];
}

class ContactDto extends PublicUserDto {
  @Exclude()
  contacts: User[];
}

export class PublicUserWithContactsDto extends PublicUserDto {
  @ApiProperty({ type: ContactDto, isArray: true })
  @Type(() => ContactDto)
  contacts: User[];
}
