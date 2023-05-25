import { UserResponseDto } from '@admin/access/users/dtos';
import { AuthAccessDto } from './auth-access.dto';

export class GetMeResponseDto {
  user: UserResponseDto;
  access: AuthAccessDto;
}
