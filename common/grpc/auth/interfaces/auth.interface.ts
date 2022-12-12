import { User } from '~common/grpc/interfaces/common';
import { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';

export interface JwtPayload extends BaseJwtPayload {
  sub: string;
  username: string;
}

export type AuthorizedUser = Pick<User, 'id' | 'username'>;
