import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() createInvestmentDto: CreateInvestmentDto,
  ) {
    return this.investmentService.create(req, file, createInvestmentDto);
  }

  @Get('get')
  findAll(@Req() req: Request) {
    return this.investmentService.findAll(req);
  }

  @Get('get/:id')
  findOne(@Param('id') id: string) {
    return this.investmentService.findOne(id);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateInvestmentDto: UpdateInvestmentDto,
  ) {
    return this.investmentService.update(id, updateInvestmentDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.investmentService.remove(id);
  }
}
