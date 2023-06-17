import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateFeeArgument } from '~common/grpc/interfaces/admin_panel';

export class CreateFeeArgumentDto implements CreateFeeArgument {
  @IsOptional()
  @IsString()
  country: string = null;

  @IsNotEmpty()
  @IsNumber()
  percent: number;

  @IsOptional()
  @IsNumber()
  fixed_usd: number = null;
}
