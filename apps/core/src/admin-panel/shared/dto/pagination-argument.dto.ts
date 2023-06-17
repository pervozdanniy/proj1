import { IsNotEmpty, IsString } from 'class-validator';
import { PaginationArgument } from '~common/grpc/interfaces/admin_panel';

export class PaginationArgumentDto implements PaginationArgument {
  @IsNotEmpty()
  @IsString()
  pagination_params: string;
}
