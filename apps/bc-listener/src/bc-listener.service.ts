import { Injectable } from '@nestjs/common';

@Injectable()
export class BcListenerService {
  getHello(): string {
    return 'Hello World!';
  }
}
