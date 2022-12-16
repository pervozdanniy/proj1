import { ApiProperty } from '@nestjs/swagger';
import { AuthData } from '~common/grpc/interfaces/auth';

export class AuthResponseDto implements AuthData {
  @ApiProperty()
  access_token: string;
}
