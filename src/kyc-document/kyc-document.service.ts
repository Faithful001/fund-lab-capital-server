import { Injectable } from '@nestjs/common';
import { CreateKycDocumentDto } from './dto/create-kyc-document.dto';
import { UpdateKycDocumentDto } from './dto/update-kyc-document.dto';

@Injectable()
export class KycDocumentService {
  create(createKycDocumentDto: CreateKycDocumentDto) {
    return 'This action adds a new kycDocument';
  }

  findAll() {
    return `This action returns all kycDocument`;
  }

  findOne(id: number) {
    return `This action returns a #${id} kycDocument`;
  }

  update(id: number, updateKycDocumentDto: UpdateKycDocumentDto) {
    return `This action updates a #${id} kycDocument`;
  }

  remove(id: number) {
    return `This action removes a #${id} kycDocument`;
  }
}
