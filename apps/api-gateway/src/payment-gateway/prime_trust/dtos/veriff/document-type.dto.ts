import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { VeriffDocumentTypesEnum } from '~common/enum/document-types.enum';

export class VeriffDocumentTypeDto {
  @ApiProperty({ enum: Object.values(VeriffDocumentTypesEnum) })
  @IsNotEmpty()
  @IsEnum(VeriffDocumentTypesEnum)
  @Type(() => String)
  type: VeriffDocumentTypesEnum;
}
