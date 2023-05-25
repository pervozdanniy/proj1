import { RolesAccessDto } from '@modules/auth/dtos/roles-access.dto';
import { ApiProperty } from '@nestjs/swagger';

export class AuthAccessDto {
  @ApiProperty()
  additionalPermissions: string[];

  @ApiProperty({ type: [RolesAccessDto] })
  roles: RolesAccessDto[];
}
