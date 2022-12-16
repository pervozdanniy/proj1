import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDTO {
  @ApiProperty({ example: 'gevorg' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 200)
  username: string;

  @ApiProperty({ example: 'gevor276@gmail.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Length(2, 100)
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  // @IsPhoneNumber()
  @Length(2, 50)
  phone?: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 200)
  password: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  country_id: number;
}
