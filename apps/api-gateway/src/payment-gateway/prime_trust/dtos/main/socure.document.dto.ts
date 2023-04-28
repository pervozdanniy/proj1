import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SocureDocumentDto {
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  uuid: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  issuing_date: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  expiration_date: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  document_number: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  status: string;
}
