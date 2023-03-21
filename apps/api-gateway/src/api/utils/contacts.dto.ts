import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ContactsResponse } from '~common/grpc/interfaces/core';
import { PublicUserDto } from './public-user.dto';

export class ContactsResponseDto implements ContactsResponse {
  @ApiProperty({ type: PublicUserDto })
  @Type(() => PublicUserDto)
  contacts: PublicUserDto[];
  @ApiProperty()
  has_more: boolean;
  @ApiProperty()
  last_id: number | undefined;
}
