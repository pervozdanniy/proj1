import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { CreateRequest } from '~common/grpc/interfaces/core';

export class RegisterDto {
  // @IsNotEmpty()
  // @IsString()
  // @ApiProperty()
  // username: string;
  //
  // @IsNotEmpty()
  // @IsString()
  // @IsEmail()
  // @ApiProperty()
  // email: string;
  //
  // @IsNotEmpty()
  // @IsString()
  // @ApiProperty()
  // password: string;
  //
  // @IsOptional()
  // @IsPhoneNumber()
  // @ApiPropertyOptional()
  // phone?: string;
}
