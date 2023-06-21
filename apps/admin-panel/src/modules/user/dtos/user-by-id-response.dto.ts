import { UserAgreementDto } from '@/modules/user/dtos/user-agreement.dto';
import { UserDetailsDto } from '@/modules/user/dtos/user-details.dto';
import { UserDocumentDto } from '@/modules/user/dtos/user-document.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { User } from '~common/grpc/interfaces/common';

export class UserByIdResponseDto implements User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @Exclude()
  password?: string | undefined;

  @ApiPropertyOptional()
  status?: string | undefined;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiPropertyOptional()
  phone?: string | undefined;

  @ApiPropertyOptional()
  email_verified_at?: string | undefined;

  @ApiPropertyOptional()
  source?: string | undefined;

  @ApiPropertyOptional({ type: UserDetailsDto })
  @Type(() => UserDetailsDto)
  details?: UserDetailsDto | undefined;

  @ApiProperty({ type: 'UserByIdResponseDto', isArray: true })
  @Type(() => UserByIdResponseDto)
  contacts: User[];

  @ApiPropertyOptional({ type: UserAgreementDto })
  @Type(() => UserAgreementDto)
  agreement?: UserAgreementDto | undefined;

  @ApiPropertyOptional()
  country_code?: string | undefined;

  @ApiPropertyOptional()
  social_id?: string | undefined;

  @ApiProperty({ type: UserDocumentDto, isArray: true })
  @Type(() => UserDocumentDto)
  documents: UserDocumentDto[];
}
