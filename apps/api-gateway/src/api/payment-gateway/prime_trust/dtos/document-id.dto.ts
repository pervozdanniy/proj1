import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DocumentIdDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  document_id: string;
}
