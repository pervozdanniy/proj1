import { Request } from 'express';
import { User } from '~common/grpc/interfaces/common';

export interface Authentication {
  user: User;
  sessionId: string;
}

export interface AuthenticatedRequest extends Request {
  user: Authentication;
}
