import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { InvalidTokenException } from '../../../common/http/exceptions';
import { REFRESH_TOKEN_NAME } from '../../auth/constants';
import { TokenType } from '../enums';
import { TokenService } from '../services';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  constructor(private tokenService: TokenService) {
    super();
  }

  /**
   * Verify the token is valid
   * @param context {ExecutionContext}
   * @returns super.canActivate(context)
   */
  canActivate(context: ExecutionContext) {
    const refreshToken = ExtractJwt.fromExtractors([
      (request) => {
        const token = request?.cookies[REFRESH_TOKEN_NAME];
        if (!token) {
          return null;
        }

        return token;
      },
    ])(context.switchToHttp().getRequest());

    if (!refreshToken) {
      throw new InvalidTokenException();
    }

    const payload = this.tokenService.verifyToken(refreshToken, TokenType.RefreshToken);
    if (!payload) {
      throw new UnauthorizedException();
    }

    return super.canActivate(context);
  }

  /**
   * Handle request and verify if exist an error or there's not user
   * @param error
   * @param user
   * @returns user || error
   */
  handleRequest(error: any, user: any) {
    if (error || !user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
