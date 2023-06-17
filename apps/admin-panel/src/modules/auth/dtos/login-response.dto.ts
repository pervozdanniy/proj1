import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../admin/access/users/dtos';
import { AuthAccessDto } from './auth-access.dto';
import { TokenDto } from './token.dto';

export class LoginResponseDto {
  @ApiProperty({ type: TokenDto })
  token: TokenDto;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: AuthAccessDto })
  access: AuthAccessDto;

  constructor(payload: LoginResponseDto) {
    this.token = new TokenDto(payload.token);
    this.user = payload.user;
    this.access = payload.access;
  }
}
