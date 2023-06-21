import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import ms from 'ms';
import { ConfigInterface } from '~common/config/configuration';
import { ErrorType } from '../../../common/enums';
import { DisabledUserException, InvalidCredentialsException } from '../../../common/http/exceptions';
import { HashHelper } from '../../../helpers';
import { prepareAuthCookie, prepareLogoutCookie } from '../../../helpers/cookies';
import { UserStatus } from '../../admin/access/users/user-status.enum';
import { UserEntity } from '../../admin/access/users/user.entity';
import { UserMapper } from '../../admin/access/users/users.mapper';
import { UsersService } from '../../admin/access/users/users.service';
import { GetMeResponseDto } from '../../auth/dtos/get-me-response.dto';
import { AuthCredentialsRequestDto, JwtPayload, LoginResponseDto } from '../dtos';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
    private configService: ConfigService<ConfigInterface>,
  ) {}

  /**
   * User authentication
   * @param authCredentialsDto {AuthCredentialsRequestDto}
   * @returns {Promise<LoginResponseDto>}
   */
  public async login({ username, password }: AuthCredentialsRequestDto, response: Response): Promise<LoginResponseDto> {
    const user: UserEntity = await this.usersService.findUserByUsername(username);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const passwordMatch = await HashHelper.compare(password, user.password);

    if (!passwordMatch) {
      throw new InvalidCredentialsException();
    }
    if (user.status == UserStatus.Blocked) {
      throw new DisabledUserException(ErrorType.BlockedUser);
    }
    if (user.status == UserStatus.Inactive) {
      throw new DisabledUserException(ErrorType.InactiveUser);
    }

    const payload: JwtPayload = { id: user.id, username: user.username };
    const token = await this.tokenService.generateAuthToken(payload);

    this.setAuthCookie(response, token.refreshToken);

    const userDto = await UserMapper.toDto(user);
    const { permissions, roles } = await UserMapper.toDtoWithRelations(user);
    const additionalPermissions = permissions.map(({ slug }) => slug);
    const mappedRoles = roles.map(({ name, permissions }) => {
      const rolePermissions = permissions.map(({ slug }) => slug);

      return {
        name,
        permissions: rolePermissions,
      };
    });

    return new LoginResponseDto({
      user: userDto,
      token,
      access: {
        additionalPermissions,
        roles: mappedRoles,
      },
    });
  }

  public async getMe(user: UserEntity): Promise<GetMeResponseDto> {
    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (user.status == UserStatus.Blocked) {
      throw new DisabledUserException(ErrorType.BlockedUser);
    }
    if (user.status == UserStatus.Inactive) {
      throw new DisabledUserException(ErrorType.InactiveUser);
    }

    const userDto = await UserMapper.toDto(user);
    const { permissions, roles } = await UserMapper.toDtoWithRelations(user);
    const additionalPermissions = permissions.map(({ slug }) => slug);
    const mappedRoles = roles.map(({ name, permissions }) => {
      const rolePermissions = permissions.map(({ slug }) => slug);

      return {
        name,
        permissions: rolePermissions,
      };
    });

    return {
      user: userDto,
      access: {
        additionalPermissions,
        roles: mappedRoles,
      },
    };
  }

  public setAuthCookie(response: Response, refreshToken: string): void {
    const maxAge = +ms(this.configService.get('admin_panel.refresh_token_ttl', { infer: true })) / 1000;
    const cookieDomain = this.configService.get('admin_panel.cookie_domain', { infer: true });
    prepareAuthCookie(response, refreshToken, cookieDomain, maxAge);
  }

  public setLogoutCookie(response: Response): void {
    const cookieDomain = this.configService.get('admin_panel.cookie_domain', { infer: true });
    prepareLogoutCookie(response, cookieDomain);
  }
}
