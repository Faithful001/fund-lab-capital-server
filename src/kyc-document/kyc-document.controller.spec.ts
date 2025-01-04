import { Test, TestingModule } from '@nestjs/testing';
import { KycDocumentController } from './kyc-document.controller';
import { KycDocumentService } from './kyc-document.service';

describe('KycDocumentController', () => {
  let controller: KycDocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KycDocumentController],
      providers: [KycDocumentService],
    }).compile();

    controller = module.get<KycDocumentController>(KycDocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
