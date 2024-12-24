import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';
import mongoose from 'mongoose';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() createUserDto: CreateUserDto,
    @Body('referral_code') referral_code?: string,
  ) {
    return await this.userService.register(createUserDto, referral_code);
  }

  @Post('auth/verify-account')
  @HttpCode(HttpStatus.OK)
  async verifyAccount(
    @Body('otp') otp: string,
    @Body('user_id') user_id: mongoose.Types.ObjectId,
  ) {
    return await this.userService.verifyAccount(otp, user_id);
  }

  @Post('auth/request-verification-otp')
  @HttpCode(HttpStatus.OK)
  async requestAccountVerificationOtp(
    @Body('user_id') user_id: mongoose.Types.ObjectId,
  ) {
    return await this.userService.requestAccountVerificationOtp(user_id);
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.userService.login(email, password);
  }

  @Post('auth/verify-token')
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Body('token') token: string) {
    return await this.userService.verifyToken(token);
  }

  @Get('get')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findUser(@Query('amount') amount?: number) {
    return await this.userService.findUsers(amount);
  }
}
