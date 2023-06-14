import { Pagination, PaginationRequest, PaginationResponseDto } from '@/libs/pagination';
import { FilterDto } from '@/libs/pagination/dto/filter.dto';
import { BaseUserResponseDto } from '@/modules/user/dtos/base-user-response.dto';
import { UserByIdResponseDto } from '@/modules/user/dtos/user-by-id-response.dto';
import { HttpException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '../../../../../common/grpc/helpers';
import { UserAdminServiceClient, USER_ADMIN_SERVICE_NAME } from '../../../../../common/grpc/interfaces/admin_panel';

@Injectable()
export class UserService implements OnModuleInit {
  private adminPanelService: UserAdminServiceClient;
  constructor(@InjectGrpc('core') private readonly adminPanel: ClientGrpc) {}

  onModuleInit() {
    this.adminPanelService = this.adminPanel.getService(USER_ADMIN_SERVICE_NAME);
  }

  async getUserList(pagination: PaginationRequest): Promise<PaginationResponseDto<BaseUserResponseDto>> {
    if (pagination?.params?.filter) {
      if (validateSync(plainToInstance(FilterDto, pagination.params)).length > 0) {
        throw new HttpException(
          {
            statusCode: 400,
            message: 'filter must be a json string',
          },
          400,
        );
      }

      pagination.params.filter = JSON.parse(pagination.params.filter);
    }

    const pagination_params = JSON.stringify(pagination);
    const { total, users } = await firstValueFrom(this.adminPanelService.getUserList({ pagination_params }));

    return Pagination.of<BaseUserResponseDto>(
      pagination,
      total,
      plainToInstance(BaseUserResponseDto, users, { excludePrefixes: ['_'] }),
    );
  }

  async getUserById(id: number): Promise<UserByIdResponseDto> {
    const response = await firstValueFrom(this.adminPanelService.getUserById({ id }));

    if (!response.user) {
      throw new NotFoundException();
    }

    return plainToInstance(UserByIdResponseDto, response.user, { excludePrefixes: ['_'] });
  }

  async updateUserStatus(id: number, status: string): Promise<BaseUserResponseDto> {
    const response = await firstValueFrom(this.adminPanelService.updateUserStatus({ id, status }));

    if (!response.user) {
      throw new NotFoundException();
    }

    return plainToInstance(BaseUserResponseDto, response.user, { excludePrefixes: ['_'] });
  }
}
