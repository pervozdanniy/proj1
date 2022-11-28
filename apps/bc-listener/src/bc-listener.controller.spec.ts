import { Test, TestingModule } from '@nestjs/testing';
import { BcListenerController } from './bc-listener.controller';
import { BcListenerService } from './bc-listener.service';

describe('BcListenerController', () => {
  let bcListenerController: BcListenerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BcListenerController],
      providers: [BcListenerService],
    }).compile();

    bcListenerController = app.get<BcListenerController>(BcListenerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(bcListenerController.getHello()).toBe('Hello World!');
    });
  });
});
