import { PartialType } from '@nestjs/mapped-types';
import { CreateKycDocumentDto } from './create-kyc-document.dto';

export class UpdateKycDocumentDto extends PartialType(CreateKycDocumentDto) {}
