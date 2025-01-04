import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalMessageController } from './withdrawal-message.controller';
import { WithdrawalMessageService } from './withdrawal-message.service';

describe('WithdrawalMessageController', () => {
  let controller: WithdrawalMessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WithdrawalMessageController],
      providers: [WithdrawalMessageService],
    }).compile();

    controller = module.get<WithdrawalMessageController>(WithdrawalMessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
