import { UserResponseDto } from '@admin/access/users/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { AuthAccessDto } from './auth-access.dto';

export class GetMeResponseDto {
  @ApiProperty()
  user: UserResponseDto;

  @ApiProperty()
  access: AuthAccessDto;
}
