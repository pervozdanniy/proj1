import { IsNotEmpty, IsString } from 'class-validator';
import { UserListArgument } from '~common/grpc/interfaces/admin_panel';

export class RequestListDto implements UserListArgument {
  @IsNotEmpty()
  @IsString()
  pagination_params: string;
}
