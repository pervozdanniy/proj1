import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserAgreement } from '~common/grpc/interfaces/common';

export class UserAgreementDto implements UserAgreement {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  status?: boolean | undefined;
}
