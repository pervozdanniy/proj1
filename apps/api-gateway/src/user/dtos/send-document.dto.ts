import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DocumentTypesEnum } from '~common/enum/document-types.enum';
import { Type } from 'class-transformer';

export class SendDocumentDto {
  @ApiProperty({ enum: Object.values(DocumentTypesEnum) })
  @IsEnum(DocumentTypesEnum)
  @Type(() => String)
  readonly label: DocumentTypesEnum;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
