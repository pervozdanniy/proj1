import { Controller, Get } from '@nestjs/common';
import { BcListenerService } from './bc-listener.service';

@Controller()
export class BcListenerController {
  constructor(private readonly bcListenerService: BcListenerService) {}

  @Get()
  getHello(): string {
    return this.bcListenerService.getHello();
  }
}
