import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transfer } from '~common/grpc/interfaces/admin_panel';

export class TransferResponseDto implements Transfer {
  @ApiProperty()
  public id: number;

  @ApiProperty()
  public user_id: number;

  @ApiPropertyOptional()
  public receiver_id?: number | undefined;

  @ApiPropertyOptional()
  public uuid?: string | undefined;

  @ApiPropertyOptional()
  public param_id?: number | undefined;

  @ApiPropertyOptional()
  public param_type?: string | undefined;

  @ApiPropertyOptional()
  public type?: string | undefined;

  @ApiPropertyOptional()
  public payment_type?: string | undefined;

  @ApiPropertyOptional()
  public provider?: string | undefined;

  @ApiPropertyOptional()
  public amount?: number | undefined;

  @ApiPropertyOptional()
  public amount_usd?: number | undefined;

  @ApiPropertyOptional()
  public fee?: number | undefined;

  @ApiPropertyOptional()
  public currency_type?: string | undefined;

  @ApiPropertyOptional()
  public status?: string | undefined;

  @ApiPropertyOptional()
  public created_at?: string | undefined;

  @ApiPropertyOptional()
  public updated_at?: string | undefined;
}
