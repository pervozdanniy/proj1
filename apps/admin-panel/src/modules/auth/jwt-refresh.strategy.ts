import { UserStatus } from '@admin/access/users/user-status.enum';
import { UserEntity } from '@admin/access/users/user.entity';
import { UsersService } from '@admin/access/users/users.service';
import { ErrorType } from '@adminCommon/enums';
import { DisabledUserException, InvalidCredentialsException } from '@adminCommon/http/exceptions';
import { REFRESH_TOKEN_NAME } from '@modules/auth/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './dtos';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private usersService: UsersService, configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          const token = request?.cookies[REFRESH_TOKEN_NAME];
          if (!token) {
            return null;
          }

          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('admin_panel.token_secret', { infer: true }),
    });
  }

  async validate({ username }: JwtPayload): Promise<UserEntity> {
    const user = await this.usersService.findUserByUsername(username);
    if (!user) {
      throw new InvalidCredentialsException();
    }
    if (user.status == UserStatus.Inactive) {
      throw new DisabledUserException(ErrorType.InactiveUser);
    }
    if (user.status == UserStatus.Blocked) {
      throw new DisabledUserException(ErrorType.BlockedUser);
    }

    return user;
  }
}
