import { ApiProperty } from '@nestjs/swagger';
import { RolesAccessDto } from '../../auth/dtos/roles-access.dto';

export class AuthAccessDto {
  @ApiProperty()
  additionalPermissions: string[];

  @ApiProperty({ type: [RolesAccessDto] })
  roles: RolesAccessDto[];
}
