import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddAssetDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  unit_count: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  account_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contact_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  asset_transfer_method_id: string;
}
