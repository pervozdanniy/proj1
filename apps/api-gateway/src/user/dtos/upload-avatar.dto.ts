import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadAvatarDto {
  @ApiPropertyOptional({ type: 'file', format: 'binary' })
  avatar: Express.Multer.File;
}
