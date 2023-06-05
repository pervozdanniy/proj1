import { UserBase, UserList } from '~common/grpc/interfaces/admin_panel';

export class ResponseUserListDto implements UserList {
  users: UserBase[];
  total: number;
}
