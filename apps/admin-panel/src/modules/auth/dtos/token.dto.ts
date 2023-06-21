import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty()
  tokenType: string;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  accessTokenExpires: number;

  constructor(tokensPayload: TokenDto) {
    this.tokenType = tokensPayload.tokenType;
    this.accessToken = tokensPayload.accessToken;
    this.accessTokenExpires = tokensPayload.accessTokenExpires;
  }
}
