import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty()
  login: string;

  @ApiPropertyOptional()
  password?: string;
}
