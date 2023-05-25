import { ApiProperty } from '@nestjs/swagger';

export class RolesAccessDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  permissions: string[];
}
