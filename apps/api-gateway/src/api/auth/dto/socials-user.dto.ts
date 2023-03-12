import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { UserSourceEnum } from '~common/constants/user';

export class SocialsUserDto {
  @ApiProperty({ example: 'test453_sd@gmail.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Length(2, 100)
  email: string;

  @ApiProperty({ example: '+37495017680' })
  @IsNotEmpty()
  // @IsPhoneNumber()
  phone: string;

  @ApiProperty({ enum: Object.values(UserSourceEnum) })
  @IsEnum(UserSourceEnum)
  @Type(() => String)
  source: UserSourceEnum;
}
