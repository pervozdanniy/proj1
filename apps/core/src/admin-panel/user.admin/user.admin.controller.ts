import { PaginationArgumentDto } from '@/admin-panel/shared/dto/pagination-argument.dto';
import { RequestByIdDto } from '@/admin-panel/user.admin/dto/arguments/request-by-id.dto';
import { UpdateUserStatusArgumentDto } from '@/admin-panel/user.admin/dto/arguments/update-user-status-argument.dto';
import { UserListResponseDto } from '@/admin-panel/user.admin/dto/response/user-list.response.dto';
import { UserBaseDocumentDto } from '@/admin-panel/user.admin/dto/user-base-document.dto';
import { UserAdminService } from '@/admin-panel/user.admin/user.admin.service';
import { UserResponseDto } from '@/user/dto/user-response.dto';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  NullableUserBase,
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

    return plainToInstance(UserListResponseDto, { users, total });
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateUserStatus({ id, status }: UpdateUserStatusArgumentDto): Promise<NullableUserBase> {
    const user = await this.userAdminService.updateUserStatus(id, status);

    if (user) {
      return { user: plainToInstance(UserBaseDocumentDto, user) };
    }

    return {};
  }
}
