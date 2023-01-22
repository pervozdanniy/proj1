import { Request } from 'express';
import { User } from '~common/grpc/interfaces/common';

export interface JwtAuthentication {
  user: User;
  sessionId: string;
  isAuthenticated: boolean;
}

export interface JwtAuthenticatedRequest extends Request {
  user: JwtAuthentication;
}
