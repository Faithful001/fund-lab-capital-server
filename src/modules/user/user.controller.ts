import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';
import mongoose from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { ResetPasswordGuard } from 'src/guards/reset-password.guard';

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

  @Roles(Role.USER)
  @UseGuards(AuthGuard)
  @Get('get-one')
  @HttpCode(HttpStatus.OK)
  async getUser(@Req() req: Request) {
    return await this.userService.getUser(req);
  }

  @Roles(Role.USER)
  @UseGuards(AuthGuard)
  @Patch('update')
  @HttpCode(HttpStatus.OK)
  async updateUser(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateUser(req, updateUserDto);
  }

  @Roles(Role.USER)
  @UseGuards(AuthGuard)
  @Post('pay-for-verification')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'kyc-image', maxCount: 1 },
      { name: 'transaction-image', maxCount: 1 },
    ]),
  )
  async payForAccountVerification(
    @Req() req: Request,
    @UploadedFiles()
    files: {
      'kyc-image': Express.Multer.File[];
      'transaction-image': Express.Multer.File[];
    },
    @Body('amount') amount: number,
    @Body('gateway') gateway: string,
  ) {
    const kycFile = files['kyc-image']?.[0];
    const transactionFile = files['transaction-image']?.[0];

    return await this.userService.payForAccountVerification(
      req,
      {
        kyc: kycFile,
        transaction: transactionFile,
      },
      amount,
      gateway,
    );
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

  @Post('auth/request-reset-password-otp')
  @HttpCode(HttpStatus.OK)
  async requestResetPasswordOtp(@Body('email') email: string) {
    return await this.userService.requestResetPasswordOtp(email);
  }

  @Post('auth/verify-reset-password-otp')
  @HttpCode(HttpStatus.OK)
  async verifyResetPasswordOtp(
    @Body('otp') otp: string,
    @Body('email') email: string,
  ) {
    return await this.userService.verifyResetPasswordOtp(otp, email);
  }

  @Roles(Role.USER)
  @UseGuards(ResetPasswordGuard)
  @Post('auth/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Req() req: Request,
    @Body('password') password: string,
    @Body('email') email: string,
  ) {
    return await this.userService.resetPassword(req, password, email);
  }

  @Get('get-all')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async findUser(@Query('amount') amount?: number) {
    return await this.userService.findUsers(amount);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Post('send-email')
  @HttpCode(HttpStatus.OK)
  sendEmail(
    @Body('emails') emails: string[],
    @Body('subject') subject: string,
    @Body('message') message: string,
  ) {
    return this.userService.sendEmail(emails, subject, message);
  }
}
