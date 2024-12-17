import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Request } from 'express';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('get')
  @HttpCode(HttpStatus.OK)
  async findAll(@Req() req: Request) {
    return await this.transactionService.findAll(req);
  }

  @Get('get/:id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return await this.transactionService.findOne(req, id);
  }

  @Get('get-by-type/:type')
  @HttpCode(HttpStatus.OK)
  async findByType(
    @Req() req: Request,
    @Param('type') type: string,
    @Query('status') status?: 'pending' | 'approved' | 'declined',
  ) {
    return await this.transactionService.findByType(req, type, status);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.transactionService.remove(id);
  }
}
