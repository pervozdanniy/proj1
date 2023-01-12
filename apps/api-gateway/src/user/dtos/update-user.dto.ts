import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { UpdateRequest } from '~common/grpc/interfaces/core';
import { UserDetails } from '~svc/api-gateway/src/user/dtos/create-user.dto';

export class UpdateUserDto implements UpdateRequest {
  id: number;

  @ApiProperty({ example: 'gevorg' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 200)
  username: string;

  @ApiProperty({ required: true, example: '+37495017680' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  country_id: number;

  @ApiProperty({ type: UserDetails })
  @ValidateNested()
  @IsOptional()
  @Type(() => UserDetails)
  details?: UserDetails;

  @IsOptional()
  @IsArray()
  @IsPhoneNumber(undefined, { each: true })
  new_contacts: string[];

  @IsOptional()
  @IsArray()
  @IsPhoneNumber(undefined, { each: true })
  removed_contacts: string[];
}
