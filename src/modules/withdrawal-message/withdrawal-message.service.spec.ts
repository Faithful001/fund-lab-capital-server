import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalMessageService } from './withdrawal-message.service';

describe('WithdrawalMessageService', () => {
  let service: WithdrawalMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WithdrawalMessageService],
    }).compile();

    service = module.get<WithdrawalMessageService>(WithdrawalMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
