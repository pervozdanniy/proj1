import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtSessionGuard extends AuthGuard('jwt-session') {}
