import { HttpException, HttpStatus } from '@nestjs/common';

export class PrimeTrustException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
