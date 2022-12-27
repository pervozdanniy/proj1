import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Length, ValidateNested } from 'class-validator';

class UserDetails {
  @ApiProperty({ example: 'gevorg' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  first_name: string;

  @ApiProperty({ example: 'poghosyan' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  last_name: string;

  @ApiProperty({ example: 'Las Vegas' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  city: string;

  @ApiProperty({ example: 'NV' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ example: '1995-07-12' })
  @IsString()
  @IsNotEmpty()
  date_of_birth: string;

  @ApiProperty({ example: '123 MK Road' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  street: string;

  @ApiProperty({ example: 89145 })
  @IsNumber()
  @IsOptional()
  postal_code: number;

  @ApiProperty({ example: 123123123 })
  @IsNumber()
  @IsNotEmpty()
  tax_id_number: number;
}

export class CreateUserDTO {
  @ApiProperty({ example: 'gevorg' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 200)
  username: string;

  @ApiProperty({ example: 'test453_sd@gmail.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Length(2, 100)
  email: string;

  @ApiProperty({ required: true, example: '+37495017680' })
  @IsString()
  @IsOptional()
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

  @ApiProperty({ type: UserDetails })
  @ValidateNested()
  @Type(() => UserDetails)
  details: UserDetails;
}
