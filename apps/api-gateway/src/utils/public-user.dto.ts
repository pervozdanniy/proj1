import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { SendType } from '~common/constants/user';
import { User, UserAgreement, UserDetails, UserDocument } from '~common/grpc/interfaces/common';

export class UserDetailsDto implements UserDetails {
  @ApiPropertyOptional({ example: 'first_name' })
  first_name?: string;

  @ApiPropertyOptional({ example: 'last_name' })
  last_name?: string;

  @ApiPropertyOptional({ example: 'Las Vegas' })
  city?: string;

  @ApiPropertyOptional({ example: 'NV' })
  region?: string;

  @ApiPropertyOptional({ format: 'date', example: '1995-09-09' })
  date_of_birth?: string;

  @ApiPropertyOptional({ example: '123 MK Road' })
  street?: string;

  @ApiPropertyOptional({ example: '12' })
  apartment?: string;

  @ApiPropertyOptional({ example: 89145 })
  postal_code?: number;

  @ApiPropertyOptional({ example: 123123123 })
  tax_id_number?: number;

  @ApiPropertyOptional({ enum: Object.values(SendType) })
  send_type?: SendType;

  @ApiPropertyOptional({ format: 'uri' })
  avatar?: string;
}

export class UserDocumentDto implements UserDocument {
  @ApiProperty()
  label: string;
  @ApiProperty()
  status: string;
}

export class PublicUserDto implements User {
  agreement?: UserAgreement;

  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @Exclude()
  password: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  phone: string;

  @ApiPropertyOptional()
  email_verified_at?: string;

  @ApiPropertyOptional({ type: UserDetailsDto })
  @Type(() => UserDetailsDto)
  details?: UserDetails;

  @Exclude()
  source: string;

  contacts: User[];

  @ApiProperty()
  country_code: string;

  @Exclude()
  social_id?: string;

  @Type(() => UserDocumentDto)
  documents: UserDocumentDto[];
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
