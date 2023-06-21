import { ApiProperty } from '@nestjs/swagger';
import { UserDocument } from '~common/grpc/interfaces/common';

export class UserDocumentDto implements UserDocument {
  @ApiProperty()
  label: string;

  @ApiProperty()
  status: string;
}
