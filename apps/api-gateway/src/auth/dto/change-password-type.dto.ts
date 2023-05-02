import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ChangePasswordTypes } from '~common/enum/change-password-types';

export class ChangePasswordTypeDto {
  // @ApiProperty({ example: 'phone or email' })
  @ApiProperty({ example: 'email' })
  @IsEnum(ChangePasswordTypes)
  @IsNotEmpty()
  type: ChangePasswordTypes;
}
