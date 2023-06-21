import { UserBaseDocumentDto } from '@/admin-panel/user.admin/dto/user-base-document.dto';
import { UserList } from '~common/grpc/interfaces/admin_panel';

export class UserListResponseDto implements UserList {
  users: UserBaseDocumentDto[];
  total: number;
}
