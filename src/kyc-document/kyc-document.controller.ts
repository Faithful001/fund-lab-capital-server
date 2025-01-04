import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KycDocumentService } from './kyc-document.service';
import { CreateKycDocumentDto } from './dto/create-kyc-document.dto';
import { UpdateKycDocumentDto } from './dto/update-kyc-document.dto';

@Controller('kyc-document')
export class KycDocumentController {
  constructor(private readonly kycDocumentService: KycDocumentService) {}

  @Post()
  create(@Body() createKycDocumentDto: CreateKycDocumentDto) {
    return this.kycDocumentService.create(createKycDocumentDto);
  }

  @Get()
  findAll() {
    return this.kycDocumentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kycDocumentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKycDocumentDto: UpdateKycDocumentDto) {
    return this.kycDocumentService.update(+id, updateKycDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kycDocumentService.remove(+id);
  }
}
