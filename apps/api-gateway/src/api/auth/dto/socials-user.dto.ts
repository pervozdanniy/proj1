import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { UserSourceEnum } from '~common/constants/user';

export class SocialsUserDto {
  @ApiProperty({ example: '1212sdsdsa434' })
  @IsString()
  @IsOptional()
  social_id?: string;

  @ApiProperty({ example: 'test@gmail.com' })
  @IsString()
  @IsOptional()
  @IsEmail()
  @Length(2, 100)
  email?: string;

  @ApiProperty({ enum: Object.values(UserSourceEnum) })
  @IsEnum(UserSourceEnum)
  @Type(() => String)
  source: UserSourceEnum;
}
