import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'old password' })
  @IsNotEmpty()
  old_password: string;

  @ApiProperty({ example: 'new password' })
  @IsNotEmpty()
  new_password: string;
}
