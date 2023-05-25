import { UserStatus } from '@admin/access/users/user-status.enum';
import { UserEntity } from '@admin/access/users/user.entity';
import { UserMapper } from '@admin/access/users/users.mapper';
import { UsersService } from '@admin/access/users/users.service';
import { ErrorType } from '@adminCommon/enums';
import { DisabledUserException, InvalidCredentialsException } from '@adminCommon/http/exceptions';
import { HashHelper } from '@helpers';
import { GetMeResponseDto } from '@modules/auth/dtos/get-me-response.dto';
import { Injectable } from '@nestjs/common';
import { AuthCredentialsRequestDto, JwtPayload, LoginResponseDto } from '../dtos';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private tokenService: TokenService) {}

  /**
   * User authentication
   * @param authCredentialsDto {AuthCredentialsRequestDto}
   * @returns {Promise<LoginResponseDto>}
   */
  public async login({ username, password }: AuthCredentialsRequestDto): Promise<LoginResponseDto> {
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
      token,
      access: {
        additionalPermissions,
        roles: mappedRoles,
      },
    };
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
}
