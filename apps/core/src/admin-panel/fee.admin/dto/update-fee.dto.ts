import { IsNumber, IsOptional, IsString } from 'class-validator';
import { UpdateFee } from '~common/grpc/interfaces/admin_panel';

export class UpdateFeeDto implements UpdateFee {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsNumber()
  percent?: number;

  @IsOptional()
  @IsNumber()
  fixed_usd?: number;
}
