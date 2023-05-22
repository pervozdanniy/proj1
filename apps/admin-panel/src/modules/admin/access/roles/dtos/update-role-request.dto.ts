import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { CreateRoleRequestDto } from './create-role-request.dto';

export class UpdateRoleRequestDto extends CreateRoleRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}
