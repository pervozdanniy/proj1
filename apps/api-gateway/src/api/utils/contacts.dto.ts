import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Contact, ContactsResponse } from '~common/grpc/interfaces/core';

class ContactDto implements Contact {
  @ApiProperty()
  id: number;
  @ApiProperty()
  email: string;
  @ApiProperty()
  first_name: string;
  @ApiProperty()
  last_name: string;
  @ApiProperty()
  phone: string;
}

export class ContactsResponseDto implements ContactsResponse {
  @ApiProperty({ type: ContactDto })
  @Type(() => ContactDto)
  contacts: ContactDto[];
  @ApiProperty()
  has_more: boolean;
  @ApiProperty()
  last_id: number | undefined;
}
