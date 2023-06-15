import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { CreateFeeArgument } from '~common/grpc/interfaces/admin_panel';

export class CreateFeeBodyDto implements CreateFeeArgument {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(3)
  @MinLength(2)
  @Transform(({ value }) => value?.toUpperCase())
  country?: string | undefined;

  @ApiProperty()
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
