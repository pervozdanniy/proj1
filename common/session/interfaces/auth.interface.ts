import { Request } from 'express';

export interface JwtAuthentication {
  sessionId: string;
}

export interface JwtAuthenticatedRequest extends Request {
  user: JwtAuthentication;
}
