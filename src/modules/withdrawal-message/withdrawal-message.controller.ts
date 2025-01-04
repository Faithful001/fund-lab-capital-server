import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { WithdrawalMessageService } from './withdrawal-message.service';
import { CreateWithdrawalMessageDto } from './dto/create-withdrawal-message.dto';
import { UpdateWithdrawalMessageDto } from './dto/update-withdrawal-message.dto';
import mongoose from 'mongoose';
import { AuthGuard } from 'src/guards/auth.guard';
import { VerificationGuard } from 'src/guards/verification.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { Request } from 'express';

@Controller('withdrawal-message')
export class WithdrawalMessageController {
  constructor(
    private readonly withdrawalMessageService: WithdrawalMessageService,
  ) {}

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('create')
  async create(
    @Body('user_id') user_id: mongoose.Types.ObjectId,
    @Body('message') message: string,
    @Body('amount') amount: number,
  ) {
    return await this.withdrawalMessageService.create(user_id, message, amount);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('get/:user_id')
  async get(@Param('user_id') user_id: mongoose.Types.ObjectId) {
    return await this.withdrawalMessageService.get(user_id);
  }

  @Roles(Role.USER)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('user/get')
  async getForUser(@Req() req: Request) {
    return await this.withdrawalMessageService.getForUser(req);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('delete/:user_id')
  async delete(@Param('user_id') user_id: mongoose.Types.ObjectId) {
    return await this.withdrawalMessageService.delete(user_id);
  }
}
