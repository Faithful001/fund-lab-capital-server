import { Test, TestingModule } from '@nestjs/testing';
import { KycDocumentService } from './kyc-document.service';

describe('KycDocumentService', () => {
  let service: KycDocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KycDocumentService],
    }).compile();

    service = module.get<KycDocumentService>(KycDocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
