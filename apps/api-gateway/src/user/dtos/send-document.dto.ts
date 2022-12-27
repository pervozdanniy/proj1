import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DocumentTypesEnum } from '~common/enum/document-types.enum';

export class SendDocumentDto {
  @ApiProperty({ enum: Object.values(DocumentTypesEnum) })
  @IsEnum(DocumentTypesEnum)
  @Type(() => String)
  readonly label: DocumentTypesEnum;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ format: 'binary' })
  file: string;
}
