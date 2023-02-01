import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectGrpc } from '~common/grpc/helpers';
import { User } from '~common/grpc/interfaces/common';
import { UserServiceClient } from '~common/grpc/interfaces/core';
import { PaymentGatewayServiceClient } from '~common/grpc/interfaces/payment-gateway';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UpdateUserDto, UserContactsDto } from './dtos/update-user.dto';
import { RegistrationResponseDto } from './dtos/user.dto';

@Injectable()
export class UserService implements OnModuleInit {
  private userService: UserServiceClient;
  private paymentGateway: PaymentGatewayServiceClient;

  constructor(@InjectGrpc('core') private readonly core: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.core.getService('UserService');
    this.paymentGateway = this.core.getService('PaymentGatewayService');
  }

  getById(id: number) {
    return firstValueFrom(this.userService.getById({ id }));
  }

  async findByLogin(login: string): Promise<User | undefined> {
    const { user } = await firstValueFrom(this.userService.findByLogin({ login }));

    return user;
  }

  async create(data: CreateUserDTO): Promise<RegistrationResponseDto> {
    const user = await firstValueFrom(this.userService.create(data));

    return { user, providerRegistered: true };
  }

  update(request: UpdateUserDto) {
    return firstValueFrom(this.userService.update(request));
  }

  updateContacts(id: number, contacts: UserContactsDto) {
    return firstValueFrom(this.userService.updateContacts({ user_id: id, contacts }));
  }
}
