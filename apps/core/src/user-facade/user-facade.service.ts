import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SuccessResponse, User } from '~common/grpc/interfaces/common';
import { CheckIfUniqueRequest, NullableUser } from '~common/grpc/interfaces/core';
//import { PaymentGatewayService } from '../payment-gateway/services/payment-gateway.service';
import { FindRequestDto } from '../user/dto/find.request.dto';
import { CreateRequestDto, UpdateContactsRequestDto, UpdateRequestDto } from '../user/dto/user-request.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { UserContactService } from '../user/services/user-contact.service';
import { UserService } from '../user/services/user.service';

@Injectable()
export class UserFacadeService {
  private readonly logger = new Logger(UserFacadeService.name);

  constructor(
    private readonly userService: UserService,
    private readonly contactService: UserContactService, //  private readonly payment: PaymentGatewayService,
  ) {}

  async updateContacts(payload: UpdateContactsRequestDto): Promise<User> {
    const user = await this.userService.get(payload.user_id);
    await this.contactService.update(user, payload.contacts.phones);

    const updated = await this.userService.get(payload.user_id);

    return plainToInstance(UserResponseDto, updated);
  }

  async create({ contacts, ...payload }: CreateRequestDto): Promise<User> {
    const user = await this.userService.create(payload);
    this.contactService
      .update(user, contacts)
      .catch((error) => this.logger.error('Create user: contacts syncronization failed', error));

    /** we can uncomment this part after when registration will be done in mobile because in
     prime trust we cant delete accounts,it is difficult for testing **/

    //  await this.payment.createAccount(user.id);

    return plainToInstance(UserResponseDto, { ...user });
  }

  async findByLogin(payload: FindRequestDto): Promise<NullableUser> {
    const user = await this.userService.findByLogin(payload);
    if (user) {
      return { user: plainToInstance(UserResponseDto, user) };
    }

    return {};
  }

  async getById(id: number): Promise<User> {
    const user = await this.userService.get(id);

    return plainToInstance(UserResponseDto, user);
  }

  async delete(id: number) {
    const success = await this.userService.delete(id);
    this.contactService
      .detach(id)
      .catch((error) => this.logger.error('Delete user: contacts syncronyzation failed', error));

    return { success };
  }

  async update({ contacts, ...payload }: UpdateRequestDto): Promise<User> {
    const user = await this.userService.update(payload);
    if (contacts) {
      this.contactService
        .update(user, contacts.phones)
        .catch((error) => this.logger.error('Update user: contacts syncronization failed', error));
    }

    return plainToInstance(UserResponseDto, user);
  }

  async checkIfUnique(payload: CheckIfUniqueRequest): Promise<SuccessResponse> {
    const success = await this.userService.checkIfUnique(payload);

    return { success };
  }
}
