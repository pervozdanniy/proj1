import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SuccessResponse, User } from '~common/grpc/interfaces/common';
import {
  CheckIfUniqueRequest,
  ContactsResponse,
  NullableUser,
  SearchContactRequest,
  UserServiceController,
  UserServiceControllerMethods,
  VerifyRequest,
} from '~common/grpc/interfaces/core';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { FindRequestDto } from '../user/dto/find.request.dto';
import { IdRequestDto } from '../user/dto/id-request.dto';
import { CreateRequestDto, UpdateContactsRequestDto, UpdateRequestDto } from '../user/dto/user-request.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { UserContactService } from '../user/services/user-contact.service';
import { UserService } from '../user/services/user.service';
import { UserFacadeService } from './user-facade.service';

@RpcController()
@UserServiceControllerMethods()
export class UserFacadeController implements UserServiceController {
  getContacts(request: SearchContactRequest): Promise<ContactsResponse> {
    return this.userService.getContacts(request);
  }
  private readonly logger = new Logger(UserFacadeController.name);

  constructor(
    private readonly userService: UserService,
    private readonly contactService: UserContactService,
    private readonly userFacadeService: UserFacadeService,
  ) {}

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateContacts(payload: UpdateContactsRequestDto): Promise<User> {
    const user = await this.userService.get(payload.user_id);
    await this.contactService.update(user, payload.contacts);

    const updated = await this.userService.get(payload.user_id);

    return plainToInstance(UserResponseDto, updated);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create({ contacts, ...payload }: CreateRequestDto): Promise<User> {
    return await this.userFacadeService.create({ contacts, ...payload });
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findByLogin(payload: FindRequestDto): Promise<NullableUser> {
    const user = await this.userService.findByLogin(payload);
    if (user) {
      return { user: plainToInstance(UserResponseDto, user) };
    }

    return {};
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getById({ id }: IdRequestDto): Promise<User> {
    const user = await this.userService.get(id);

    return plainToInstance(UserResponseDto, user);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async delete({ id }: IdRequestDto) {
    const success = await this.userService.delete(id);
    this.contactService
      .detach(id)
      .catch((error) => this.logger.error('Delete user: contacts syncronyzation failed', error));

    return { success };
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update({ contacts, ...payload }: UpdateRequestDto): Promise<User> {
    const user = await this.userService.update(payload);
    if (contacts) {
      this.contactService
        .update(user, contacts)
        .catch((error) => this.logger.error('Update user: contacts syncronization failed', error));
    }

    return plainToInstance(UserResponseDto, user);
  }

  async checkIfUnique(payload: CheckIfUniqueRequest): Promise<SuccessResponse> {
    const success = await this.userService.checkIfUnique(payload);

    return { success };
  }

  async verifySocure(payload: VerifyRequest): Promise<SuccessResponse> {
    return this.userService.verifySocure(payload);
  }
}
