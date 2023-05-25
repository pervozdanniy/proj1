import { UserResponseDto } from '@admin/access/users/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { AuthAccessDto } from './auth-access.dto';
import { TokenDto } from './token.dto';

export class LoginResponseDto {
  @ApiProperty({ type: TokenDto })
  token: TokenDto;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: AuthAccessDto })
  access: AuthAccessDto;
}
