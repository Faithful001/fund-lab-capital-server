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
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Request } from 'express';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import mongoose from 'mongoose';

enum StatusEnum {
  Pending = 'pending',
  Approved = 'approved',
  Declined = 'declined',
}

enum TypeEnum {
  Deposit = 'deposit',
  Withdrawal = 'withdrawal',
  ReferralBonus = 'referral-bonus',
  AccountVerification = 'account-verification',
  Investment = 'investment',
  FirstTradingBonus = 'first-trading-bonus',
}

@Roles(Role.USER, Role.ADMIN)
@UseGuards(AuthGuard)
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

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Patch('update-status/:id')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Query('status') status: StatusEnum,
    @Body('user_id') user_id: mongoose.Types.ObjectId,
    @Body('transaction_type') transaction_type: TypeEnum,
  ) {
    return await this.transactionService.updateStatus(
      id,
      status,
      user_id,
      transaction_type,
    );
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.transactionService.remove(id);
  }
}
