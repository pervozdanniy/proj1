import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatusEnum } from '~common/constants/user';

export class UpdateUserStatusRequestDto {
  @ApiProperty({ enum: Object.values(UserStatusEnum), example: UserStatusEnum.Active })
  @IsNotEmpty()
  @IsEnum(UserStatusEnum)
  @Type(() => String)
  status: string;
}
