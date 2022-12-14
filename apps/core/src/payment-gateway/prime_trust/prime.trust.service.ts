import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { CreateRequestDto } from '~svc/core/src/user/dto/create.request.dto';
import { GRPCException } from '~common/exceptions/grpc.exception';

export class PrimeTrustService {
  constructor(private readonly httpService: HttpService) {}

  async createUser(user: CreateRequestDto) {
    const createData = {
      data: {
        type: 'user',
        attributes: {
          email: user.email,
          name: user.username,
          password: user.password,
        },
      },
    };
    const result = await lastValueFrom(this.httpService.post('https://sandbox.primetrust.com/v2/users', createData));

    return result.data;
  }

  async getToken(user: CreateRequestDto) {
    const headersRequest = {
      'Content-Type': 'application/json', // afaik this one is not needed
      Authorization: `Basic ${Buffer.from(`${user.email}:${user.password}`).toString('base64')}`,
    };

    const result = await lastValueFrom(
      this.httpService.post('https://sandbox.primetrust.com/auth/jwts', {}, { headers: headersRequest }),
    );

    return result.data;
  }
}
