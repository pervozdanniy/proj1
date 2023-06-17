export interface IGenerateRefreshTokenPayload {
  tokenType: string;
  accessToken: string;
  accessTokenExpires: number;
  refreshToken: string;
}
