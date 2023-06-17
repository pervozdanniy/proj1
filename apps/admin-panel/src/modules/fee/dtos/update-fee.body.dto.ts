import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { UpdateFee } from '~common/grpc/interfaces/admin_panel';

export class UpdateFeeBodyDto implements UpdateFee {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2)
  @Transform(({ value }) => value?.toUpperCase())
  country?: string | undefined;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  percent: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fixed_usd?: number | undefined;
}
