import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty()
  tokenType: string;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  accessTokenExpires: number;

  @ApiProperty()
  refreshToken: string;
}
