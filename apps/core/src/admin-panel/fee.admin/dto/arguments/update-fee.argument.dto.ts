import { UpdateFeeDto } from '@/admin-panel/fee.admin/dto/update-fee.dto';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { UpdateFeeArgument } from '~common/grpc/interfaces/admin_panel';

export class UpdateFeeArgumentDto implements UpdateFeeArgument {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsNotEmpty()
  @Type(() => UpdateFeeDto)
  @ValidateNested()
  data: UpdateFeeDto;
}
