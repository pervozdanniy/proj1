import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ContactDto } from '../../utils/contacts.dto';

export class LatestRecepientsResponseDto {
  @ApiProperty({ type: ContactDto, isArray: true })
  @Type(() => ContactDto)
  recepients: ContactDto[];
}
