import { RequestByIdDto } from '@/admin-panel/user.admin/dto/request-by-id.dto';
import { PaginationArgumentDto } from '@/admin-panel/shared/dto/pagination-argument.dto';
import { ResponseUserListDto } from '@/admin-panel/user.admin/dto/response-user-list.dto';
import { UserAdminService } from '@/admin-panel/user.admin/user.admin.service';
import { UserResponseDto } from '@/user/dto/user-response.dto';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  UserAdminServiceController,
  UserAdminServiceControllerMethods,
  UserList,
} from '~common/grpc/interfaces/admin_panel';
import { NullableUser } from '~common/grpc/interfaces/common';
import { PaginationRequest } from '~common/interfaces/pagination';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';

@RpcController()
@UserAdminServiceControllerMethods()
export class UserAdminController implements UserAdminServiceController {
  constructor(private readonly userAdminService: UserAdminService) {}

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getUserById({ id }: RequestByIdDto): Promise<NullableUser> {
    const user = await this.userAdminService.getUserById(id);

    if (user) {
      return { user: plainToInstance(UserResponseDto, user) };
    }

    return {};
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getUserList({ pagination_params }: PaginationArgumentDto): Promise<UserList> {
    const pagination: PaginationRequest = JSON.parse(pagination_params);
    const [users, total] = await this.userAdminService.getUserList(pagination);

    return plainToInstance(ResponseUserListDto, { users, total });
  }
}
