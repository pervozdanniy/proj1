import { passwordRegex } from '@/constants/regex/password.regex';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, Matches } from 'class-validator';

export class ChangePasswordRequestDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'berg1!lo',
  })
  currentPassword: string;

  @Matches(passwordRegex, { message: 'Password too weak' })
  @IsNotEmpty()
  @Length(6, 20)
  @ApiProperty({
    example: 'berg2!lo',
  })
  newPassword: string;
}
